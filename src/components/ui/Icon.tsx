import type { SVGProps } from 'react'

type IconName =
  | 'home' | 'ruta' | 'calendar' | 'doc' | 'bell' | 'user' | 'users'
  | 'chat' | 'settings' | 'logout' | 'check' | 'alert' | 'phone'
  | 'whatsapp' | 'sms' | 'speaker' | 'help' | 'right' | 'left'
  | 'pin' | 'clock' | 'plus' | 'filter' | 'search' | 'shield'
  | 'globe' | 'contrast' | 'textsize' | 'heart' | 'spark' | 'send'
  | 'flag' | 'note' | 'close'

const PATHS: Record<IconName, JSX.Element> = {
  home: <path d="M3 11l9-8 9 8M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />,
  ruta: <path d="M6 4v6a4 4 0 004 4h4a4 4 0 014 4v2M6 4a2 2 0 100-.01M18 20a2 2 0 100 .01" />,
  calendar: <path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />,
  doc: <path d="M7 3h7l5 5v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5M9 13h6M9 17h6" />,
  bell: <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />,
  user: <path d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0116 11" />,
  chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  settings: <path d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7.7 1.6 1.6 0 01-3.2 0 1.6 1.6 0 00-2.7-.7l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15a1.6 1.6 0 00-1.4-1H3a2 2 0 110-4h.1A1.6 1.6 0 004.6 9a1.6 1.6 0 00-.3-1.8l-.1-.1A2 2 0 116.9 4.3l.1.1A1.6 1.6 0 009 4.6 1.6 1.6 0 0110 3.2a1.6 1.6 0 013.1 0A1.6 1.6 0 0015 4.6a1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8 1.6 1.6 0 001.4 1h.1a2 2 0 110 4H21a1.6 1.6 0 00-1.4 1z" />,
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  check: <path d="M20 6L9 17l-5-5" />,
  alert: <path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />,
  phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 11.5a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" />,
  whatsapp: <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm0 2a8 8 0 11-4.2 14.8l-.3-.2-2.5.7.7-2.4-.2-.3A8 8 0 0112 4zm-2.7 4c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 1.9 3 4.7 4.1 2.3.9 2.8.7 3.3.7.5 0 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3l-.7-.4c-.4-.2-1.1-.6-1.3-.6-.2-.1-.3-.1-.5.1l-.6.8c-.1.1-.2.2-.5.1-.3-.1-1.1-.4-2-1.2-.8-.7-1.3-1.5-1.4-1.7-.1-.3 0-.4.1-.5l.4-.5.3-.5v-.4l-.6-1.4c-.2-.4-.3-.3-.5-.4h-.6z" />,
  sms: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2zM8 9h8M8 13h5" />,
  speaker: <path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 010 7M19 5a9 9 0 010 14" />,
  help: <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />,
  right: <path d="M5 12h14M13 6l6 6-6 6" />,
  left: <path d="M19 12H5M11 18l-6-6 6-6" />,
  pin: <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1118 0zM12 13a3 3 0 100-6 3 3 0 000 6z" />,
  clock: <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2" />,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M22 3H2l8 9.5V19l4 2v-8.5L22 3z" />,
  search: <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />,
  globe: <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />,
  contrast: <path d="M12 22a10 10 0 100-20 10 10 0 000 20zM12 2v20" />,
  textsize: <path d="M4 7V5h10v2M9 5v14M7 19h4M15 13v-1h6v1M18 12v7M16 19h4" />,
  heart: <path d="M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  flag: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />,
  note: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
}

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
}

export default function Icon({ name, size = 22, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}

export type { IconName }
