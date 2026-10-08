export const STATUS={Todo:0,InProgress:1,Completed:2,Cancelled:3} as const;
export const PRIORITY={Low:0,Medium:1,High:2,Critical:3} as const;
export const statusName=(v:number)=>Object.keys(STATUS).find(k=>(STATUS as any)[k]===v)??'Todo';
export const priorityName=(v:number)=>Object.keys(PRIORITY).find(k=>(PRIORITY as any)[k]===v)??'Medium';
export const parseEnum=(v:any,map:any,def:number)=>typeof v==='number'?v:(map[v]??def);
