"use client";

import { FormEvent, useState } from "react";
import {
    MessageCircle,
    Send,
    X,
} from "lucide-react";

type Gender =
    | "Male"
    | "Female"
    | "Non-binary"
    | "Prefer not to say";

type Message = {
    id: number;
    nickname: string;
    text: string;
    own?: boolean;
};

type ChatPanelProps = {
    onClose: () => void;
};

export default function ChatPanel({
    onClose,
}: ChatPanelProps) {

    const [hasJoined, setHasJoined] =
        useState(false);

    const [nickname, setNickname] =
        useState("");

    const [gender, setGender] =
        useState<Gender | "">("");

    const [message, setMessage] =
        useState("");

    const [messages, setMessages] =
        useState<Message[]>([
            {
                id: 1,
                nickname: "MusicFan",
                text: "Hey everyone 👋",
            },
            {
                id: 2,
                nickname: "Rahul",
                text: "This song is 🔥",
            },
            {
                id: 3,
                nickname: "Priya",
                text: "Love this one ❤️",
            },
        ]);


    // ==========================================
    // JOIN CHAT
    // ==========================================

    const joinChat = (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        const cleanNickname =
            nickname.trim();

        if (
            !cleanNickname ||
            !gender
        ) {
            return;
        }

        setNickname(cleanNickname);
        setHasJoined(true);
    };


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const sendMessage = (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        const cleanMessage =
            message.trim();

        if (
            !cleanMessage ||
            !hasJoined
        ) {
            return;
        }

        setMessages((current) => [
            ...current,
            {
                id: Date.now(),
                nickname,
                text: cleanMessage,
                own: true,
            },
        ]);

        setMessage("");
    };


    // ==========================================
    // UI
    // ==========================================

    return (
        <aside
            className="
    absolute
    right-[30%]
    top-0
    z-40
    flex
    h-full
    w-[20%]
    flex-col
    border-r
    border-white/10
    bg-[#0b151b]/90
    text-[var(--foreground)]
    backdrop-blur-2xl
    shadow-2xl
  "
        >

            {/* ======================================
          HEADER
      ====================================== */}

            <div
                className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-white/10
          px-5
          py-4
        "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white/10
            "
                    >
                        <MessageCircle
                            size={17}
                            className="text-white/80"
                        />
                    </div>


                    <div>

                        <p
                            className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-white/40
              "
                        >
                            Live Chat
                        </p>


                        <div className="mt-1 flex items-center gap-2">

                            <span
                                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                "
                            />

                            <span
                                className="
                  text-xs
                  text-white/55
                "
                            >
                                24 listeners
                            </span>

                        </div>

                    </div>

                </div>


                {/* CLOSE */}

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close chat"
                    className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-white/45
            transition
            hover:bg-white/10
            hover:text-white
          "
                >
                    <X size={17} />
                </button>

            </div>


            {/* ======================================
          BEFORE JOINING
      ====================================== */}

            {!hasJoined ? (

                <div
                    className="
            flex
            flex-1
            items-center
            justify-center
            px-6
          "
                >

                    <form
                        onSubmit={joinChat}
                        className="w-full"
                    >

                        <div
                            className="
                mb-6
                text-center
              "
                        >

                            <div
                                className="
                  mx-auto
                  mb-4
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                "
                            >

                                <MessageCircle
                                    size={24}
                                    className="text-white/70"
                                />

                            </div>


                            <h2
                                className="
                  text-lg
                  font-semibold
                  text-white
                "
                            >
                                Join Live Chat
                            </h2>


                            <p
                                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/40
                "
                            >
                                Choose a nickname to join
                                the conversation.
                            </p>

                        </div>


                        {/* NICKNAME */}

                        <div className="mb-4">

                            <label
                                htmlFor="chat-nickname"
                                className="
                  mb-2
                  block
                  text-[11px]
                  text-white/50
                "
                            >
                                Nickname
                            </label>


                            <input
                                id="chat-nickname"
                                type="text"
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter nickname"
                                maxLength={25}
                                autoComplete="off"
                                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-3
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/25
                  focus:border-white/30
                  focus:bg-white/[0.08]
                "
                            />

                        </div>


                        {/* GENDER */}

                        <div className="mb-5">

                            <label
                                htmlFor="chat-gender"
                                className="
                  mb-2
                  block
                  text-[11px]
                  text-white/50
                "
                            >
                                Gender
                            </label>


                            <select
                                id="chat-gender"
                                value={gender}
                                onChange={(event) =>
                                    setGender(
                                        event.target.value as Gender
                                    )
                                }
                                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.06]
                  px-3
                  text-sm
                  text-white
                  outline-none
                  focus:border-white/30
                "
                            >

                                <option
                                    value=""
                                    disabled
                                    className="bg-neutral-900"
                                >
                                    Select gender
                                </option>


                                <option
                                    value="Male"
                                    className="bg-neutral-900"
                                >
                                    Male
                                </option>


                                <option
                                    value="Female"
                                    className="bg-neutral-900"
                                >
                                    Female
                                </option>


                                <option
                                    value="Non-binary"
                                    className="bg-neutral-900"
                                >
                                    Non-binary
                                </option>


                                <option
                                    value="Prefer not to say"
                                    className="bg-neutral-900"
                                >
                                    Prefer not to say
                                </option>

                            </select>

                        </div>


                        {/* JOIN */}

                        <button
                            type="submit"
                            disabled={
                                !nickname.trim() ||
                                !gender
                            }
                            className="
                h-11
                w-full
                rounded-xl
                bg-white
                text-sm
                font-medium
                text-black
                transition
                hover:bg-white/90
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
                        >
                            Join Chat
                        </button>

                    </form>

                </div>

            ) : (

                /* ====================================
                   CHAT AFTER JOIN
                ==================================== */

                <>

                    {/* MESSAGES */}

                    <div
                        className="
              min-h-0
              flex-1
              overflow-y-auto
              px-4
              py-4
            "
                    >

                        {messages.map((item) => (

                            <div
                                key={item.id}
                                className={`
                  mb-4
                  ${item.own
                                        ? "text-right"
                                        : "text-left"
                                    }
                `}
                            >

                                <div
                                    className={`
                    mb-1
                    flex
                    items-center
                    gap-2
                    text-[10px]
                    ${item.own
                                            ? "justify-end"
                                            : "justify-start"
                                        }
                  `}
                                >

                                    <span
                                        className={
                                            item.own
                                                ? "text-white/60"
                                                : "text-white/40"
                                        }
                                    >
                                        {item.nickname}
                                    </span>


                                    {item.own && (

                                        <span
                                            className="
                        text-[9px]
                        text-white/25
                      "
                                        >
                                            You
                                        </span>

                                    )}

                                </div>


                                <div
                                    className={`
                    inline-block
                    max-w-[85%]
                    rounded-2xl
                    px-3
                    py-2
                    text-xs
                    leading-5
                    ${item.own
                                            ? "bg-white text-black"
                                            : "bg-white/[0.08] text-white/75"
                                        }
                  `}
                                >
                                    {item.text}
                                </div>

                            </div>

                        ))}

                    </div>


                    {/* =================================
              MESSAGE INPUT
          ================================= */}

                    <form
                        onSubmit={sendMessage}
                        className="
              shrink-0
              border-t
              border-white/10
              p-3
            "
                    >

                        <div
                            className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.05]
                px-3
              "
                        >

                            <input
                                type="text"
                                value={message}
                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }
                                placeholder="Message..."
                                maxLength={300}
                                className="
                  h-10
                  min-w-0
                  flex-1
                  bg-transparent
                  text-xs
                  text-white
                  outline-none
                  placeholder:text-white/25
                "
                            />


                            <button
                                type="submit"
                                disabled={!message.trim()}
                                aria-label="Send message"
                                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-black
                  transition
                  hover:scale-105
                  disabled:cursor-not-allowed
                  disabled:opacity-25
                "
                            >

                                <Send size={14} />

                            </button>

                        </div>


                        <p
                            className="
                mt-2
                px-1
                text-[9px]
                text-white/20
              "
                        >
                            You are chatting as {nickname}
                        </p>

                    </form>

                </>

            )}

        </aside>
    );
}