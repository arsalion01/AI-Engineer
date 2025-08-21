var h=[],g=[],f=[],p=[],I=[{id:"ecommerce-order-automation",name:"E-commerce Order Automation",description:"Automated order processing, inventory updates, and customer notifications",category:"e-commerce",json:{nodes:[{parameters:{httpMethod:"POST",path:"/order-webhook",responseMode:"onReceived"},id:"1",name:"Order Webhook",type:"n8n-nodes-base.webhook",typeVersion:1,position:[240,300]},{parameters:{operation:"create",resource:"database",table:"orders"},id:"2",name:"Save Order",type:"n8n-nodes-base.postgres",typeVersion:1,position:[460,300]}],connections:{"Order Webhook":{main:[[{node:"Save Order",type:"main",index:0}]]}}},nodes:[],isCustom:!1},{id:"lead-generation-crm",name:"Lead Generation & CRM Integration",description:"Capture leads, qualify them, and sync with CRM systems",category:"sales",json:{nodes:[{parameters:{httpMethod:"POST",path:"/lead-capture"},id:"1",name:"Lead Form Webhook",type:"n8n-nodes-base.webhook",typeVersion:1,position:[240,300]}],connections:{}},nodes:[],isCustom:!1}];function s(t){return{"Access-Control-Allow-Origin":t||"*","Access-Control-Allow-Methods":"GET, POST, PUT, DELETE, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization, X-Requested-With","Content-Type":"application/json"}}function m(){return Math.random().toString(36).substring(2)+Date.now().toString(36)}function j(t){return Promise.resolve({email:"user@example.com",name:"Demo User",picture:"https://api.dicebear.com/7.x/avataaars/svg?seed=demo"})}async function b(t,o){let c=p.find(r=>r.userId===o);if(c&&c.requestsUsed>=c.requestsLimit)throw new Error("Quota exceeded. Please upgrade your plan.");return A(t)}function A(t){let o=t.toLowerCase();return o.includes("ecommerce")||o.includes("online store")?`Based on your e-commerce automation requirements, I recommend a comprehensive solution with the following components:

**Technical Blueprint:**

1. **Order Processing Pipeline**
   - Webhook integration with your e-commerce platform
   - Automated inventory checks and updates
   - Payment processing validation
   - Order status notifications

2. **Customer Communication**
   - Automated order confirmation emails
   - Shipping notifications with tracking
   - Review request sequences
   - Abandoned cart recovery

3. **Inventory Management**
   - Real-time stock level monitoring
   - Automatic reorder triggers
   - Supplier notifications
   - Low stock alerts

**n8n Workflow Components:**
- E-commerce platform webhook receiver
- Database operations for order management
- Email/SMS notification system
- CRM integration for customer data
- Analytics and reporting pipeline

**Implementation Timeline:** 2-3 weeks
**Estimated Cost:** $2,500 - $4,000

Would you like me to create the detailed workflow templates for any specific part of this system?`:o.includes("lead")||o.includes("crm")||o.includes("sales")?`Perfect! Here's a comprehensive lead generation and CRM automation blueprint:

**System Architecture:**

1. **Lead Capture & Qualification**
   - Multi-channel lead capture (website, social media, ads)
   - Automatic lead scoring based on behavior and demographics
   - Real-time lead qualification workflows
   - Duplicate detection and management

2. **CRM Integration & Management**
   - Seamless data sync with major CRM platforms
   - Automated contact creation and updates
   - Pipeline stage progression rules
   - Activity logging and timeline management

3. **Nurturing & Follow-up**
   - Personalized email sequences
   - SMS automation for high-priority leads
   - Calendar booking integration
   - Task creation for sales team

**Technical Specifications:**
- REST API integrations for form submissions
- Webhook processing for real-time updates
- Advanced conditional logic for lead routing
- Integration with 20+ popular CRM systems

**ROI Projection:** 40-60% increase in lead conversion
**Implementation:** 1-2 weeks

Shall I proceed with creating the specific n8n workflow templates for your CRM system?`:`Thank you for your project details! I'm analyzing your requirements and will create a comprehensive automation blueprint.

To provide the most effective solution, I need to understand:

1. **Current Process Analysis**
   - What manual steps are currently involved?
   - Where do bottlenecks or errors typically occur?
   - What tools/software are you currently using?

2. **Scale & Volume**
   - How many transactions/processes per day?
   - Expected growth over the next 12 months?
   - Peak usage periods or seasonal variations?

3. **Integration Requirements**
   - Which systems need to connect?
   - Any existing APIs or databases?
   - Security and compliance requirements?

4. **Success Metrics**
   - How will we measure automation success?
   - What's your primary goal: time savings, accuracy, or scale?

Once I have these details, I'll create a detailed technical blueprint with:
- System architecture diagram
- n8n workflow specifications
- Implementation timeline
- Cost breakdown
- Risk assessment

What specific aspect would you like to explore first?`}function R(t){return{id:m(),overview:"Comprehensive AI automation system designed for your specific business needs.",technicalSpecs:[{component:"Data Pipeline",description:"Automated data collection and processing system",requirements:["Real-time processing","Error handling","Data validation"],dependencies:["Database","API endpoints"]},{component:"Integration Layer",description:"Connects all systems and services",requirements:["API management","Authentication","Rate limiting"],dependencies:["Third-party services","Internal systems"]}],integrations:[{service:"Primary Platform",type:"api",credentials:["API Key","OAuth Token"],rateLimit:1e3}],timeline:[{phase:"Setup & Configuration",duration:"3-5 days",tasks:["Environment setup","API configurations","Initial testing"],deliverables:["Development environment","Configuration files"]},{phase:"Core Development",duration:"1-2 weeks",tasks:["Workflow creation","Integration development","Testing"],deliverables:["Working workflows","Integration tests"]}],estimatedCost:3500,riskAssessment:[{risk:"API rate limiting",impact:"medium",mitigation:"Implement request queuing and retry logic"}]}}function S(t,o){return{id:m(),name:"Custom Automation Workflow",description:"Tailored workflow for your specific automation needs",category:"custom",json:{nodes:[{parameters:{httpMethod:"POST",path:"/automation-trigger"},id:"1",name:"Trigger",type:"n8n-nodes-base.webhook",typeVersion:1,position:[240,300]},{parameters:{operation:"process",resource:"data"},id:"2",name:"Process Data",type:"n8n-nodes-base.function",typeVersion:1,position:[460,300]}],connections:{Trigger:{main:[[{node:"Process Data",type:"main",index:0}]]}}},nodes:[],isCustom:!0,projectId:t}}var P={async fetch(t){let o=new URL(t.url),c=t.method,r=t.headers.get("Origin")||"*";if(c==="OPTIONS")return new Response(null,{headers:s(r)});try{if(o.pathname==="/api/health"&&c==="GET")return Response.json({status:"healthy",timestamp:new Date().toISOString(),version:"2.0.0",services:{ai:"operational",workflows:"operational",auth:"operational"}},{headers:s(r)});if(o.pathname==="/api/auth/google"&&c==="POST"){let{token:i}=await t.json(),n=await j(i);if(!n)return Response.json({error:"Invalid Google token"},{status:401,headers:s(r)});let e=h.find(a=>a.email===n.email);return e?e.lastLoginAt=new Date().toISOString():(e={id:m(),email:n.email,name:n.name,avatar:n.picture,geminiQuotaUsed:0,geminiQuotaLimit:100,subscriptionTier:"free",createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString()},h.push(e),p.push({userId:e.id,requestsUsed:0,requestsLimit:100,tokensUsed:0,tokensLimit:5e4,resetDate:new Date(Date.now()+30*24*60*60*1e3).toISOString()})),Response.json({user:e,token:`mock_jwt_${e.id}`,quota:p.find(a=>a.userId===e.id)},{headers:s(r)})}if(o.pathname==="/api/projects"&&c==="GET"){let i=t.headers.get("Authorization");if(!i)return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let n=i.replace("Bearer mock_jwt_",""),e=g.filter(a=>a.userId===n);return Response.json({projects:e},{headers:s(r)})}if(o.pathname==="/api/projects"&&c==="POST"){let i=t.headers.get("Authorization");if(!i)return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let n=i.replace("Bearer mock_jwt_",""),{title:e,description:a}=await t.json(),d={id:m(),userId:n,title:e,description:a,phase:"requirements",progress:10,requirements:[],workflows:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return g.push(d),Response.json({project:d},{status:201,headers:s(r)})}if(o.pathname==="/api/chat"&&c==="POST"){let i=t.headers.get("Authorization");if(!i)return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let n=i.replace("Bearer mock_jwt_",""),{message:e,projectId:a}=await t.json();try{let d=await b(e,n),w={id:m(),projectId:a||"",role:"user",content:e,type:"text",timestamp:new Date().toISOString()};f.push(w);let y={id:m(),projectId:a||"",role:"assistant",content:d,type:"text",timestamp:new Date().toISOString()};f.push(y);let u=p.find(k=>k.userId===n);return u&&(u.requestsUsed+=1,u.tokensUsed+=Math.floor(e.length/4)),Response.json({response:d,quotaRemaining:u?u.requestsLimit-u.requestsUsed:0},{headers:s(r)})}catch(d){return Response.json({error:d.message},{status:429,headers:s(r)})}}if(o.pathname==="/api/workflows"&&c==="GET"){let i=o.searchParams.get("category"),n=I;return i&&(n=n.filter(e=>e.category===i)),Response.json({workflows:n,categories:["e-commerce","sales","marketing","support","finance","hr"]},{headers:s(r)})}if(o.pathname==="/api/workflows/generate"&&c==="POST"){if(!t.headers.get("Authorization"))return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let{projectId:n,requirements:e}=await t.json(),a=S(n,e);return Response.json({workflow:a},{headers:s(r)})}let l=o.pathname.match(/^\/api\/projects\/([^/]+)\/blueprint$/);if(l&&c==="POST"){if(!t.headers.get("Authorization"))return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let n=l[1],e=g.find(d=>d.id===n);if(!e)return Response.json({error:"Project not found"},{status:404,headers:s(r)});let a=R(e.requirements);return e.blueprint=a,e.phase="blueprint",e.progress=40,e.updatedAt=new Date().toISOString(),Response.json({blueprint:a},{headers:s(r)})}if(o.pathname==="/api/user/quota"&&c==="GET"){let i=t.headers.get("Authorization");if(!i)return Response.json({error:"Authorization required"},{status:401,headers:s(r)});let n=i.replace("Bearer mock_jwt_",""),e=p.find(a=>a.userId===n);return Response.json({quota:e||{requestsUsed:0,requestsLimit:100,tokensUsed:0,tokensLimit:5e4}},{headers:s(r)})}return Response.json({error:"Not Found",path:o.pathname},{status:404,headers:s(r)})}catch(l){return console.error("AI Engineer API Error:",l),Response.json({error:"Internal Server Error"},{status:500,headers:s(r)})}}};export{P as default};
