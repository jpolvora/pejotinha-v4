import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramMessage } from '@/actions/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Telegram sends 'message' object
    const message = body.message;
    if (!message || !message.text || !message.chat) {
      return NextResponse.json({ ok: true }); // Ignore non-text messages
    }

    const chatId = message.chat.id.toString();
    const text = message.text;

    const responseText = await handleTelegramMessage(chatId, text);

    // Send response back to Telegram
    // In a real app, you'd call fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, ...)
    // For now, we log it and return ok.
    console.log(`Telegram Bot Response for Chat ${chatId}: ${responseText}`);
    
    // If you have the bot token, you can actually send it here:
    /*
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown'
        })
      });
    }
    */

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
