import { PhoneIcon, VideoIcon, MoreVerticalIcon } from "lucide-react";

interface WhatsAppPreviewProps {
  contactName: string;
  messages: Array<{
    id: string;
    text: string;
    sender: "user" | "agent";
    time: string;
  }>;
}

export function WhatsAppPreview({
  contactName,
  messages,
}: WhatsAppPreviewProps) {
  return (
    <div className="w-full max-w-sm mx-auto bg-[#0b141a] rounded-lg overflow-hidden shadow-2xl border border-[#2a3942]">
      {/* WhatsApp Header */}
      <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
            {contactName.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">{contactName}</h3>
            <p className="text-gray-400 text-xs">online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <VideoIcon className="w-5 h-5 text-gray-400" />

          <PhoneIcon className="w-5 h-5 text-gray-400" />

          <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* WhatsApp Chat Background */}
      <div
        className="h-[400px] overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "#0b141a",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "agent" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                message.sender === "agent"
                  ? "bg-[#005c4b] text-white"
                  : "bg-[#1f2c34] text-white"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">
                {message.text}
              </p>
              <div
                className={`flex items-center justify-end gap-1 mt-1 ${
                  message.sender === "agent" ? "text-gray-300" : "text-gray-400"
                }`}
              >
                <span className="text-[10px]">{message.time}</span>
                {message.sender === "agent" && (
                  <svg
                    width="16"
                    height="8"
                    viewBox="0 0 16 8"
                    fill="none"
                    className="inline-block"
                  >
                    <path
                      d="M15.01 1.99l-5.66 5.66a.5.5 0 01-.71 0L5.99 5l-.71.71 3.01 3.01a1 1 0 001.42 0l6.01-6.01-.71-.72z"
                      fill="currentColor"
                    />

                    <path
                      d="M11.01 1.99l-5.66 5.66a.5.5 0 01-.71 0L1.99 5l-.71.71 3.01 3.01a1 1 0 001.42 0l6.01-6.01-.71-.72z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* WhatsApp Input */}
      <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center">
          <span className="text-gray-400 text-sm">Type a message</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
