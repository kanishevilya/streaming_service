import { SocialLink, User, UserSecurity } from "@/prisma/generated";
import { SessionMetadata } from "@/src/shared/types/session-metada.types";

export const MESSAGES = {
  welcome: `
      👋 <strong>Добро пожаловать в наше приложение!</strong>
  
      Мы рады, что вы с нами. Чтобы начать получать уведомления, вам нужно связать ваш аккаунт.
  
      Для этого перейдите в раздел <strong>"Уведомления"</strong>, чтобы завершить настройку. Как только это будет сделано, уведомления начнут поступать вам прямо в Telegram!
  
      <em>Чтобы продолжить, нажмите на кнопку ниже и перейдите на сайт для завершения настройки.</em>
    `,
  authSuccess: "✅ <strong>Аутентификация успешна!</strong> Ваш аккаунт теперь связан с платформой, и вы готовы получать уведомления.",
  invalidToken: "⚠️ <strong>Ошибка:</strong> Недействительный или просроченный токен. Пожалуйста, попробуйте снова.",
  enableTwoFactor:
    `🔐 <b>Безопасность важна!</b>\n\n` +
    `Для защиты вашего аккаунта включите двухфакторную аутентификацию в <a href="https://4f30-37-151-36-118.ngrok-free.app/dashboard/settings">настройках аккаунта</a>.`,
};

export const FUNCTIONS = {
  profile: (user: User, userSecurity: UserSecurity, followersCount: number, followingsCount: number) => `
  🧑‍💻 <strong>Профиль пользователя ${user.username}</strong>

  👤 <em>Имя пользователя:</em> ${user.username}  
  📝 <em>Отображаемое имя:</em> ${user.displayName}
  ✉️ <em>Электронная почта:</em> ${user.email}
  
  👥 <em>Количество подписчиков:</em> ${followersCount}
  👥 <em>Количество подписок:</em> ${followingsCount}
  
  🔒 <em>Двухфакторная аутентификация:</em> ${userSecurity.isTwoFAEnabled ? "Включена" : "Отключена"}
  📅 <em>Дата регистрации:</em> ${user.createdAt.toLocaleString()}

  Чтобы изменить профиль, перейдите в настройки.`,
  formatFollowing: (follower: User, socialLinks: SocialLink[]) =>
    `👤 <strong>${follower.displayName}</strong>\n` +
    `Канал: <a href="https://4f30-37-151-36-118.ngrok-free.app/${follower.username}">${follower.username}</a>\n` +
    `🔗 Социальные сети: ${socialLinks.map(link => `<a href="${link.url}">${link.title}</a>`).join(', ')}`,
  streamStart: (channel: User) =>
    `<b>📡 Трансляция на канале ${channel.displayName} началась!</b>\n\n` +
    `Присоединяйтесь и смотрите: <a href="https://4f30-37-151-36-118.ngrok-free.app/${channel.username}">Перейти к трансляции</a>`,
  newFollower: (follower: User, followersCount: number) =>
    `<b>🎉 Новый подписчик!</b>\n\n` +
    `Пользователь <a href="https://4f30-37-151-36-118.ngrok-free.app/${follower.username}">${follower.displayName}</a> подписался на ваш канал.\n\n` +
    `Теперь у вас <b>${followersCount}</b> подписчиков!`,
  resetPassword: (token: string, metadata: SessionMetadata) =>
    `<b>🔑 Восстановление доступа в Nokurami</b>\n\n` +
    `Вы запросили сброс пароля для вашего аккаунта на платформе <b>Nokurami</b>.\n\n` +
    `Чтобы восстановить доступ, перейдите по следующей ссылке для сброса пароля:\n` +
    `<b><a href="https://4f30-37-151-36-118.ngrok-free.app/account/recovery/${token}">Сбросить пароль</a></b>\n\n` +
    `📅 <b>Запрос сделан:</b> ${new Date().toLocaleDateString()} в ${new Date().toLocaleTimeString()}\n\n` +
    `🖥️ <b>Детали запроса:</b>\n\n` +
    `🌍 <b>Расположение:</b> ${metadata.location.country}, ${metadata.location.city}\n` +
    `📱 <b>Операционная система:</b> ${metadata.device.os}\n` +
    `🌐 <b>Браузер:</b> ${metadata.device.browser}\n` +
    `💻 <b>IP-адрес:</b> ${metadata.ip}\n\n` +
    `Если вы не запрашивали сброс, просто проигнорируйте это сообщение.\n\n` +
    `🙏 Спасибо, что используете Nokurami!`,
}
