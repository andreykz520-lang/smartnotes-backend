fetch('https://www.obd2scanai.online/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'payment.succeeded',
    object: {
      metadata: {
        email: 'Andreykz520@gmail.com',
        language: 'ru'
      }
    }
  })
})
.then(res => res.json())
.then(data => console.log("ОТВЕТ СЕРВЕРА:", data))
.catch(err => console.error("ОШИБКА:", err));