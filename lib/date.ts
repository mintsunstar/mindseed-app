export const fmtDate = (d:Date)=> d.toISOString().slice(0,10);
export const weekDates = (base?:Date)=>{
  const now= base ?? new Date(); const day= now.getDay(); const sun= new Date(now); sun.setDate(now.getDate()-day);
  return Array.from({length:7}).map((_,i)=>{ const dd= new Date(sun); dd.setDate(sun.getDate()+i); return dd; });
};
