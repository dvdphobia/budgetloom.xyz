import { Icon } from './Icons'

export default function AuthorBox() {
  return (
    <div className="author-box">
      <div className="author-avatar">
        <Icon.user />
      </div>
      <div className="author-info">
        <div className="author-name">BudgetLoom Team</div>
        <div className="author-bio">Creating simple budget tools for real life.</div>
      </div>
    </div>
  )
}