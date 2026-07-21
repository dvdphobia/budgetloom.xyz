import { Icon } from './Icons'

export default function AuthorBox() {
  return (
    <div className="author-box">
      <div className="author-avatar">
        <Icon.user />
      </div>
      <div className="author-info">
        <div className="author-name">BudgetLoom Editorial Team</div>
        <div className="author-bio">We research practical budgeting methods and turn them into clear, actionable guides and free tools. Content is educational, not individualized financial advice.</div>
      </div>
    </div>
  )
}
