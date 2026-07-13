export default function PinTemplate({ title }: { title: string }) {
  return (
    <div className="pin-preview">
      <div className="pin-card">
        <div className="pin-card-brand">BudgetLoom</div>
        {title}
        <div className="pin-card-url">budgetloom.xyz</div>
      </div>
      <p className="pin-label">Pinterest pin preview — 1000 x 1500 vertical image</p>
    </div>
  )
}