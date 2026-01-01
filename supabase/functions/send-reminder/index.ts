// @ts-nocheck
import { createClient } from 'jsr:@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

Deno.serve(async (req) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return new Response('TELEGRAM_BOT_TOKEN not set', { status: 500 })
  }

  // 1. Get all users with telegram_chat_id
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, telegram_chat_id')
    .not('telegram_chat_id', 'is', null)

  if (profileError) {
    return new Response(JSON.stringify(profileError), { status: 500 })
  }

  const messagesSent = []
  const today = new Date().toISOString().split('T')[0]

  // 2. Check logs for each user
  for (const profile of profiles) {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('id')
      .eq('user_id', profile.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    if (!logs || logs.length === 0) {
      // 3. Send Telegram Message
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text: "You haven't logged your day. Strike imminent."
        })
      })
      const result = await res.json()
      messagesSent.push({ userId: profile.id, success: result.ok })
    }
  }

  return new Response(JSON.stringify({ processed: profiles.length, messagesSent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
