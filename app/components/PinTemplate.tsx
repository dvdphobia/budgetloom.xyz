export default function PinTemplate({ title }: { title: string }) {
  return (
    <div className="pin-preview">
      <div className="pin-card">
        <div style={{fontSize:'1rem', fontWeight:400, marginBottom:'1rem'}}>BudgetLoom</div>
        {title}
      </div>
      <p style={{color:'var(--gray)', marginTop:'1rem', fontSize:'0.9rem'}}>Pinterest pin preview: 1000×1500 vertical image</p>
    </div>
  )
}
