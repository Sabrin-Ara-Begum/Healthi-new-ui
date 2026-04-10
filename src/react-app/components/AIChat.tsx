import { useState } from "react"
import { sendMessage } from "../api/chatApi"

export default function AIChat() {

  const [message, setMessage] = useState("")
  const [reply, setReply] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message) return

    setLoading(true)

    try {
      const aiReply = await sendMessage(message)
      setReply(aiReply)
    } catch (err) {
      console.log(err)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Healthi AI</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your symptoms..."
        style={{ width: 300, height: 100 }}
      />

      <br /><br />

      <button onClick={handleSend}>
        Send
      </button>

      <br /><br />

      {loading && <p>Thinking...</p>}

      {reply && (
        <div>
          <h4>AI Reply:</h4>
          <p>{reply}</p>
        </div>
      )}
    </div>
  )
}