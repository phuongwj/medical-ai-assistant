import { useState } from 'react';

const ChatMessage = ({
    content,
    time, 
    isSent,
    showAvatar = true,
    onRegenerate
}) => {
    const [copied, setCopied] = useState(false);

  return (
    <div>ChatMessage</div>
  )
}

export default ChatMessage;