import { AdSlotInline } from './AdBanner'

// Server component wrapper — uses hardcoded ad codes (no DB needed)
export default function AdSlot({ placement }: { placement: string }) {
  return <AdSlotInline placement={placement} />
}