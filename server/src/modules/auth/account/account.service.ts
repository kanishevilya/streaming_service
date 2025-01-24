import { PrismaService } from '@/src/core/prisma/prisma.service';
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './inputs/create-user.input';
import { hash, verify } from 'argon2';
import { VerificationService } from '../verification/verification.service';
import { TokenType, User } from '@/prisma/generated';
import { ChangeEmailInput } from './inputs/change-email.input';
import { ChangePasswordInput } from './inputs/change-password.input';
import { GenerateToken } from '@/src/shared/utils/generate-token.util';
import { Request } from 'express';
import { MailService } from '../../lib/mail/mail.service';

@Injectable()
export class AccountService {
    public constructor(
        private readonly prismaService: PrismaService,
        private readonly verificationService: VerificationService,
        private readonly mailService: MailService,

    ) { }

    public async findAll() {
        const users = await this.prismaService.user.findMany();

        return users;
    }

    public async getUserById(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id
            },
            include: {
                socialLinks: true
            }
        })
        return user
    }

    public async create(input: CreateUserInput) {
        const { username, email, password } = input

        const isUsernameExists = await this.prismaService.user.findUnique({
            where: {
                username
            }
        })

        if (isUsernameExists) {
            throw new ConflictException('Это имя уже занято')
        }

        const isEmailExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (isEmailExists) {
            throw new ConflictException('Этот email уже занято')
        }

        const user = await this.prismaService.user.create({
            data: {
                username,
                email,
                password: await hash(password),
                displayName: username
            }
        })

        await this.verificationService.sendVerificationToken(user)

        return true
    }

    public async requestToEmailChange(
        req: Request, user: User
    ) {

        const resetToken = await GenerateToken(this.prismaService, user, TokenType.EMAIL_CHANGE)

        await this.mailService.sendMailChangeToken(
            user.email,
            resetToken.token
        )

        return true
    }

    public async changeEmail(user: User, input: ChangeEmailInput) {
        const { token, email } = input

        const existingToken = await this.prismaService.token.findUnique({
            where: {
                token: token,
                type: TokenType.EMAIL_CHANGE
            }
        })

        if (!existingToken) { throw new NotFoundException("Токен не найден") }

        const hasExpired = new Date(existingToken.expiresIn) < new Date()

        if (hasExpired) { throw new BadRequestException("Токен истек") }

        const isEmailExists = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        if (isEmailExists) {
            throw new ConflictException('Этот email уже занят')
        }

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                email,
                isEmailVerified: false
            }
        })


        await this.prismaService.token.delete({
            where: {
                id: existingToken.id,
                type: TokenType.EMAIL_CHANGE
            }
        })

        await this.verificationService.sendVerificationToken(user)

        return true;
    }

    public async changePassword(user: User, input: ChangePasswordInput) {
        const { oldPassword, newPassword } = input

        const isValidPassword = await verify(user.password, oldPassword)

        if (!isValidPassword) {
            throw new UnauthorizedException("Неверный старый пароль")
        }

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                password: await hash(newPassword)
            }
        })

        return true
    }


}
