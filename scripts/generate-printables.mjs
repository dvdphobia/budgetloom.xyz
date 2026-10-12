#!/usr/bin/env node
// Deterministic, dependency-free BudgetLoom PDF generation for Vercel builds.
import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const folder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/printables');
fs.mkdirSync(folder, { recursive: true });
const WIDTH = 612, HEIGHT = 792, LEFT = 48;
const green = '0.020 0.475 0.340', dark = '0.075 0.169 0.165', gray = '0.36 0.42 0.41', pale = '0.945 0.978 0.965';
const escapeText = (s) => String(s).replace(/[^\x20-\x7e]/g, '?').replace(/[\\()]/g, '\\$&');
const tx = (x,y,s,size=10,bold=false,color=dark) => `${color} rg BT /${bold?'F2':'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapeText(s)}) Tj ET`;
const box = (x,y,w,h,color,stroke=false)=>`${color} ${stroke?'RG':'rg'} ${x} ${y} ${w} ${h} re ${stroke?'S':'f'}`;
const rule=(x,y,w,color='0.80 0.86 0.83')=>`${color} RG 0.7 w ${x} ${y} m ${x+w} ${y} l S`;
const header=(i,n,type)=>[
  box(0,0,WIDTH,HEIGHT,'1 1 1'),box(0,780,WIDTH,12,green),
  box(LEFT,736,28,28,green), tx(84,747,'BudgetLoom',14,true),
  tx(465,749,type,8,true,gray),rule(LEFT,55,516),
  tx(LEFT,40,'budgetloom.xyz  |  Free personal budgeting printables',8,false,gray),
  tx(530,40,`${i} / ${n}`,8,false,gray)
];
function cover(title,subtitle,n,names){
 const parts=header(1,n,'FREE PRINTABLE');parts.push(box(48,424,516,275,pale));
 const split=title.length>25?[title.slice(0,25).trim(),title.slice(25).trim()]:[title];
 parts.push(tx(75,658,'PLAN / TRACK / REVIEW',11,true,green));
 split.forEach((line,i)=>parts.push(tx(75,598-i*43,line,31,true)));
 parts.push(tx(75,490,subtitle.slice(0,58),12,false,gray),box(75,438,126,33,green),tx(86,450,`${n} PAGES   FREE`,11,true,'1 1 1'));
 parts.push(tx(48,389,'INSIDE THIS WORKBOOK',14,true));
 names.slice(0,11).forEach((name,i)=>{parts.push(box(51,358-i*24,6,6,green),tx(66,354-i*24,name.slice(0,70),11));});
 return parts.join('\n');
}
function worksheet(i,n,title,sub,labels){
 const p=header(i,n,'WORKSHEET');p.push(tx(48,690,title.slice(0,46),24,true),tx(48,661,sub.slice(0,78),10,false,gray));
 p.push(box(48,596,516,32,green));
 [['ITEM / CATEGORY',57],['PLANNED',285],['ACTUAL',391],['DONE',496]].forEach(([name,x])=>p.push(tx(x,607,name,9,true,'1 1 1')));
 labels.slice(0,12).forEach((label,j)=>{
   const y=560-j*34;
   if(j%2===0)p.push(box(48,y-13,516,32,pale));
   p.push(tx(58,y, label.slice(0,35),10),rule(48,y-18,516),rule(281,y-4,88),rule(385,y-4,88),box(503,y-5,12,12,'0.75 0.83 0.80',true));
 });
 p.push(tx(48,143,'NOTES AND NEXT STEPS',12,true));
 [124,101,78].forEach(y=>p.push(rule(48,y,516)));
 return p.join('\n');
}
function amounts(target){
 const weights=Array.from({length:30},(_,i)=>3+((i*7)%15));const sum=weights.reduce((a,b)=>a+b,0);
 const a=weights.map(w=>Math.floor(target*w/sum));
 let remainder=target-a.reduce((x,y)=>x+y,0);
 for(let i=0;remainder>0;i=(i+1)%30,remainder--)a[i]++;
 if(a.reduce((x,y)=>x+y,0)!==target||a.length!==30)throw Error('Invalid savings amounts');
 return a;
}
function challenge(i,n,title,target,values){
 const p=header(i,n,'SAVINGS CHALLENGE');p.push(tx(48,688,title,24,true));
 p.push(tx(48,658,target?`30 deposits add up to exactly $${target}. Check each completed day.`:'Enter your amounts, track progress, and set your own savings goal.',10,false,gray));
 values.forEach((value,k)=>{
   const col=Math.floor(k/15),row=k%15,x=48+col*259,y=610-row*28;
   if(row%2===0)p.push(box(x,y-13,245,25,pale));
   p.push(tx(x+10,y,`Day ${String(k+1).padStart(2,'0')}`,10,true),tx(x+91,y,value===null?'$ ______':`$ ${value}`,11,true,green),box(x+220,y-2,13,13,'0.75 0.83 0.80',true));
 });
 p.push(tx(48,147,target?`TARGET TOTAL: $${target}`:'MY TARGET: $ __________',13,true,green));
 p.push(tx(48,116,'Start date: _____________________   Finish date: _____________________',11));
 p.push(tx(48,88,'Next savings goal: _________________________________________________',10));
 return p.join('\n');
}
const row=s=>s.split('|');
const budget=[
['Monthly Budget Summary','Plan income, expenses and savings with realistic amounts.','Take-home income|Other income|Housing|Utilities|Groceries|Transportation|Insurance|Minimum debt|Flexible spending|Savings transfer|Total allocated|Remaining balance'],
['Paycheck Allocation','Assign upcoming bills to each payday.','Paycheck one|Paycheck two|Additional paycheck|Housing due|Utilities due|Internet and phone|Insurance|Groceries|Transportation|Minimum payments|Savings|Carry-forward buffer'],
['Fixed Bills Tracker','Track amounts and confirm payments each month.','Rent or mortgage|Electricity|Water|Gas|Internet|Phone|Insurance|Childcare|Car payment|Minimum loan payment|Subscriptions|Other fixed bill'],
['Variable Expenses','Plan essential and optional monthly spending.','Groceries|Household supplies|Fuel or transit|Eating out|Clothing|Personal care|Healthcare|Pet costs|Entertainment|Gifts|School supplies|Other variable spending'],
['Savings Goal Tracker','Assign an amount and review progress regularly.','Emergency savings|Home repairs|Car repairs|Education|Medical costs|Travel|Holiday costs|Gift fund|Replacement electronics|Taxes|Goal eleven|Goal twelve'],
['Sinking Funds','Save monthly for predictable irregular expenses.','Insurance renewal|Annual membership|Vehicle registration|School supplies|Seasonal shopping|Appliance repair|Dental care|Vet visits|Travel|Family events|Home maintenance|Other'],
['Debt Payment Planner','Track balances, minimums and extra repayments.','Credit card one|Credit card two|Personal loan|Vehicle loan|Student loan|Medical bill|Store account|Other debt one|Other debt two|Targeted extra payment|Interest this month|Remaining total'],
['Subscriptions Audit','Record recurring charges and evaluate their value.','Video streaming|Music streaming|Cloud storage|Software|Fitness membership|Games|News|Delivery|Education|Phone extras|Other membership|Total subscriptions'],
['Weekly Spending Review','Check your real transactions against the plan.','Week one essentials|Week one optional|Week two essentials|Week two optional|Week three essentials|Week three optional|Week four essentials|Week four optional|Extra purchases|Refunds|Savings adjustment|Next weekly change'],
['Budget Buffer Planner','Prepare for surprises rather than hiding their cost.','Starting buffer|Transport surprise|Medical copay|Home repair|Unexpected bill|Grocery adjustment|Replacement item|Added income|Buffer added|Buffer used|Ending buffer|Next month goal'],
['Monthly Closeout','Compare planned and actual values to learn.','Total take-home|Fixed bills|Food and essentials|Variable spending|Savings|Debt payments|Unexpected costs|Total allocated|Remaining cash|Progress made|Next adjustment|Lesson learned']
];
const meal=[
['Weekly Meal Planner','Decide what you will eat before shopping.','Monday breakfast|Monday dinner|Tuesday breakfast|Tuesday dinner|Wednesday meals|Thursday meals|Friday meals|Saturday meals|Sunday meals|Leftovers|Prep day|Food budget'],
['Grocery Shopping List','Use a list and compare prices to your budget.','Produce|Vegetables|Proteins|Rice or pasta|Beans or lentils|Dairy or substitute|Bread|Breakfast foods|Pantry staples|Snacks|Household supplies|Checkout total'],
['Pantry Inventory','Plan meals around food already available.','Rice or pasta|Canned foods|Beans|Cooking oils|Baking supplies|Spices|Breakfast staples|Dry snacks|Shelf stable drinks|Condiments|Other pantry item|Restock next'],
['Freezer Inventory','Use dated portions before they are forgotten.','Frozen vegetables|Frozen fruit|Chicken|Beef or pork|Fish|Bread|Broth|Prepared meals|Frozen herbs|Leftovers|Other freezer item|Use first'],
['Meal Prep Checklist','Plan safe storage and reuse of leftovers.','Choose meals|Check pantry|Set grocery limit|Make shopping list|Wash produce|Prepare ingredients|Cook meals|Cool safely|Label portions|Freeze extra|Clean work area|Review leftovers'],
['Recipe Cost Calculator','Calculate total ingredients and cost per serving.','Ingredient one|Ingredient two|Ingredient three|Ingredient four|Ingredient five|Ingredient six|Ingredient seven|Ingredient eight|Spices and oil|Recipe total|Servings|Cost per serving'],
['Weekly Grocery Review','Adjust your next shopping plan using actual totals.','Planned groceries|Actual groceries|Restaurant spending|Unplanned purchases|Used leftovers|Expired food cost|Discount savings|Pantry-first meals|Costly staples|Cheaper swaps|Difference|Next week goal']
];
const debt=[
['Debt Inventory','List balances and minimum repayments.','Credit card one|Credit card two|Personal loan|Vehicle loan|Student loan|Medical bill|Store card|Other debt one|Other debt two|Total balance|Total minimums|Extra payments'],
['Snowball Priority Plan','Prioritize smallest balances first.','Smallest balance|Second debt|Third debt|Fourth debt|Fifth debt|Minimum payments|Extra money|Target payment|Starting target balance|Monthly paid|Remaining target|Next target'],
['Avalanche Priority Plan','Prioritize highest interest rates first.','Highest APR|Second APR|Third APR|Fourth APR|Fifth APR|Rate review|Total minimums|Extra payment|Interest total|Monthly payments|Remaining target|Next target'],
['Payment Log','Record each scheduled and extra payment.','Payment one|Payment two|Payment three|Payment four|Payment five|Payment six|Payment seven|Payment eight|Payment nine|Payment ten|Extra payment|Total paid'],
['Due Date Calendar','Keep payment dates visible to avoid late fees.','First due date|Second due date|Third due date|Fourth due date|Fifth due date|Sixth due date|Seventh due date|Eighth due date|Ninth due date|Tenth due date|Autopay check|Cash buffer'],
['Interest and Fee Audit','Review statements and avoid preventable costs.','Card interest one|Card interest two|Loan interest|Late fees|Annual fees|Service fees|Transfer fees|Other fees|Total interest|Rate to review|Questions|Next statement'],
['Extra Payment Plan','Allocate extra funds after essential bills.','Take-home income|Housing and bills|Food and transport|Insurance|Minimum debts|Emergency buffer|Other essentials|Remaining money|Extra amount|Target debt|New balance|Next review'],
['Debt Milestone Tracker','Review meaningful progress without new borrowing.','Starting total|10 percent reduction|25 percent reduction|50 percent reduction|75 percent reduction|First payoff|Second payoff|Third payoff|Final remaining|Last payment|Debt-free total|Next savings goal'],
['Monthly Debt Review','Check balances and realistic next steps.','Opening balance|Minimums paid|Extra payments|Interest charged|Fees charged|New borrowing|Closing balance|Progress|Budget adjustments|Upcoming due dates|Emergency buffer|Next target']
];
function toPage(p,i,n){return worksheet(i,n,p[0],p[1],row(p[2]));}
function createPdf(pageStreams){
 const objects=[null];const put=data=>(objects.push(Buffer.isBuffer(data)?data:Buffer.from(data,'latin1')),objects.length-1);
 const pagesRef=put('');const font1=put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
 const font2=put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');const references=[];
 for(const raw of pageStreams){
  const compressed=deflateSync(Buffer.from(raw,'latin1'),{level:9});
  const contentRef=put(Buffer.concat([Buffer.from(`<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`),compressed,Buffer.from('\nendstream')]));
  const pageRef=put(`<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentRef} 0 R >>`);
  references.push(pageRef);
 }
 objects[pagesRef]=Buffer.from(`<< /Type /Pages /Kids [${references.map(n=>`${n} 0 R`).join(' ')}] /Count ${references.length} >>`);
 const root=put(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`);
 const chunks=[Buffer.from('%PDF-1.4\n%BudgetLoom\n','latin1')];const offsets=[0];let offset=chunks[0].length;
 for(let i=1;i<objects.length;i++){
  offsets.push(offset);
  const chunk=Buffer.concat([Buffer.from(`${i} 0 obj\n`),objects[i],Buffer.from('\nendobj\n')]);
  chunks.push(chunk);offset+=chunk.length;
 }
 const xref=offset;let index=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
 for(let i=1;i<objects.length;i++)index+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
 index+=`trailer\n<< /Size ${objects.length} /Root ${root} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
 chunks.push(Buffer.from(index));return Buffer.concat(chunks);
}
function save(file,title,desc,pages){
 const count=pages.length+1,stream=[cover(title,desc,count,pages.map(p=>p[1]||p[0]))];
 pages.forEach((p,j)=>stream.push(typeof p==='string'?p:p[0]==='worksheet'?toPage(p.slice(1),j+2,count):challenge(j+2,count,p[1],p[2],p[3])));
 const binary=createPdf(stream);fs.writeFileSync(path.join(folder,file),binary);
 const match=binary.toString('latin1').match(/\/Type \/Page\b/g)||[];
 if(match.length!==count)throw Error(`${file}: expected ${count} pages, wrote ${match.length}`);
 console.log(file,count+' pages',binary.length+' bytes');
}
save('budget-starter-bundle.pdf','Budget Starter Bundle','A complete monthly budgeting workbook',budget.map(p=>['worksheet',...p]));
save('30-day-savings-challenge.pdf','30-Day Savings Challenge','Choose a savings target and keep your progress visible',[
 ['challenge','$100 in 30 Days',100,amounts(100)],['challenge','$300 in 30 Days',300,amounts(300)],
 ['challenge','$500 in 30 Days',500,amounts(500)],['challenge','Reverse $300 Challenge',300,amounts(300).reverse()],
 ['challenge','My Own Savings Challenge',0,Array(30).fill(null)]
]);
save('meal-planner-budget-kit.pdf','Meal Planner Budget Kit','Make food plans before you shop',meal.map(p=>['worksheet',...p]));
save('debt-payoff-planner.pdf','Debt Payoff Planner','Track debts and repayment milestones',debt.map(p=>['worksheet',...p]));