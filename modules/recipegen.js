/* ---------- recipe generator ---------- */
// Nährwerte pro 100 g (bzw. 100 ml): Name, Einkaufs-Kategorie, NOVA, kcal, Protein, KH, Fett, Ballaststoffe, Zucker, ges. Fett, Salz,
// dann Vitamin A, D, E, K, C, B1, B2, B6, Folat, B12, Calcium, Magnesium, Eisen, Zink, Kalium; optional Einheit ("ml") oder [Gramm pro Stück, Einzahl, Mehrzahl]
const FD={
 hafer:["Haferflocken","Vorrat",1,372,13.5,58.7,7,10,1,1.2,0, 0,0,.4,2,0,.5,.15,.1,32,0,54,138,4.3,3.6,360],
 reis:["Reis","Vorrat",1,350,7,77,.6,1.4,.2,.2,0, 0,0,.1,0,0,.07,.03,.15,8,0,6,25,.6,1.1,100],
 vkreis:["Vollkornreis","Vorrat",1,350,7.5,73,2.7,3.5,.7,.5,0, 0,0,.7,1.9,0,.4,.09,.5,20,0,23,143,1.5,2,268],
 quinoa:["Quinoa","Vorrat",1,368,14,64,6,7,0,.7,0, 1,0,2.4,0,0,.36,.32,.49,184,0,47,197,4.6,3.1,563],
 couscous:["Couscous","Vorrat",1,360,13,72,1,5,0,.2,0, 0,0,.1,0,0,.16,.08,.11,20,0,24,44,1.1,.8,166],
 bulgur:["Bulgur","Vorrat",1,342,12,68,1.3,12,.4,.2,0, 0,0,.1,2,0,.23,.11,.34,27,0,35,164,2.5,1.9,410],
 vknudeln:["Vollkornnudeln","Vorrat",1,350,14,64,2.5,9,3,.5,0, 0,0,.7,2,0,.45,.14,.2,44,0,40,140,3.6,2.9,360],
 nudeln:["Nudeln","Vorrat",1,357,12.5,71,1.5,3,3.5,.3,0, 0,0,.1,0,0,.1,.05,.14,18,0,21,53,1.3,1.4,220],
 kartoffel:["Kartoffeln","Obst & Gemüse",1,77,2,17,.1,2.1,.8,0,0, 0,0,.05,2,13,.1,.02,.3,10,0,5,22,.3,.3,380],
 suesskart:["Süßkartoffeln","Obst & Gemüse",1,86,1.6,20,.1,3,4.2,0,.1, 709,0,.3,2,2.4,.08,.06,.21,11,0,30,25,.6,.3,337],
 vkbrot:["Vollkornbrot","Brot & Backwaren",3,220,8,40,1.5,7,3,.3,1.1, 0,0,.6,2,0,.2,.1,.2,25,0,40,60,2.5,1.8,250,[50,"Scheibe","Scheiben"]],
 vktoast:["Vollkorntoast","Brot & Backwaren",3,250,9,42,4,6,4,.6,1.1, 0,0,.5,2,0,.2,.1,.15,30,0,50,55,2.2,1.5,220,[30,"Scheibe","Scheiben"]],
 wrap:["Vollkorn-Wraps","Brot & Backwaren",4,300,9,48,7,6,2,2,1.2, 0,0,.5,1,0,.3,.1,.1,30,0,50,50,2.5,1,200,[60,"Vollkorn-Wrap","Vollkorn-Wraps"]],
 reiswaffel:["Reiswaffeln","Vorrat",3,387,8,81,3,4,.4,.6,.1, 0,0,.3,0,0,.1,.03,.2,10,0,10,110,1.4,2,240,[8,"Reiswaffel","Reiswaffeln"]],
 kichererbsen:["Kichererbsen (Dose)","Konserven",3,120,7,16,2.6,6,.5,.3,.5, 1,0,.4,4,1.3,.1,.05,.14,90,0,43,30,1.6,1,180],
 linsen:["Rote Linsen","Vorrat",1,345,25,50,1.5,11,1.8,.2,0, 2,0,.5,5,1.7,.5,.2,.5,204,0,50,107,7.5,3.6,680],
 bohnen:["Kidneybohnen (Dose)","Konserven",3,100,7,13,.5,6,.3,.1,.5, 0,0,.03,8,1,.16,.06,.12,130,0,35,45,2.9,1,405],
 huhn:["Hähnchenbrust","Fleisch & Fisch",1,110,23,0,1.5,0,0,.4,.17, 9,.1,.2,0,0,.07,.1,.6,4,.3,5,29,.4,.9,330],
 pute:["Putenbrust","Fleisch & Fisch",1,107,24,0,1,0,0,.3,.15, 0,0,.1,0,0,.05,.1,.5,7,.4,10,27,.8,1.5,330],
 rind:["Rinderhack (mager)","Fleisch & Fisch",1,135,21,0,5.5,0,0,2.3,.17, 0,.1,.4,1,0,.05,.2,.35,7,2.5,12,20,2.3,4.8,290],
 rindsteak:["Rinderhüfte","Fleisch & Fisch",1,120,22,0,3.5,0,0,1.4,.15, 0,.1,.4,1,0,.08,.2,.45,6,2,6,24,2.4,4.5,340],
 lachs:["Lachsfilet","Fleisch & Fisch",1,202,20,0,13.6,0,0,3,.15, 15,16,2,.5,0,.2,.15,.6,26,3,12,29,.4,.4,360],
 lachsger:["Räucherlachs","Fleisch & Fisch",3,180,22,0,10,0,0,2,3, 15,16,1.5,.5,0,.15,.15,.5,10,3,11,25,.6,.4,250],
 thunfisch:["Thunfisch (Dose, eigener Saft)","Konserven",3,110,25,0,1,0,0,.3,.9, 20,3,1,0,0,.03,.1,.4,15,3,15,30,1,.6,250],
 garnelen:["Garnelen","Fleisch & Fisch",1,85,19,0,1,0,0,.2,.6, 0,0,1.3,0,0,.02,.02,.1,3,1.1,64,37,.5,1.3,170],
 seelachs:["Seelachsfilet","Fleisch & Fisch",1,80,18,0,.9,0,0,.2,.3, 10,1,.6,0,0,.08,.15,.3,10,3.5,14,35,.4,.4,370],
 tofu:["Tofu natur","Kühlregal",3,145,15,2,8.5,1,.5,1.3,.02, 0,0,0,2,0,.08,.05,.1,30,0,350,60,2.7,1.6,150],
 ei:["Eier","Kühlregal",1,145,12.5,.7,10,0,.4,3.1,.35, 160,2,1.1,.3,0,.04,.46,.17,47,.9,56,12,1.75,1.3,138,[60,"Ei","Eier"]],
 feta:["Feta","Kühlregal",3,265,17,1,21,0,1,15,2.7, 125,.4,.2,2,0,.15,.84,.42,32,1.7,490,19,.7,2.9,62],
 mozzarella:["Mozzarella","Kühlregal",3,250,18,1,19,0,1,13,.5, 180,.4,.3,2,0,.03,.3,.04,10,1.5,500,20,.4,2.8,80],
 kaese:["Bergkäse","Kühlregal",3,380,27,0,30,0,0,18,1.5, 165,.5,.5,3,0,.03,.3,.08,20,1.5,820,30,.2,3.9,120],
 huettenkaese:["Hüttenkäse","Kühlregal",3,98,12,3,4.3,0,2.7,2.8,.9, 40,0,0,0,0,.03,.16,.05,12,.4,80,8,.1,.4,100],
 frischkaese:["Frischkäse","Kühlregal",3,240,6,3,23,0,3,15,.8, 250,.2,.6,2,0,.03,.2,.05,10,.3,80,9,.1,.5,130],
 skyr:["Skyr","Kühlregal",1,63,11,4,.2,0,4,.1,.1, 2,0,0,0,0,.03,.25,.05,10,.5,150,11,.1,.5,160],
 quark:["Magerquark","Kühlregal",1,67,12,4,.3,0,4,.2,.1, 2,0,0,0,0,.04,.3,.04,15,.8,90,11,.1,.5,95],
 griechjog:["Griechischer Joghurt","Kühlregal",1,120,4,4,10,0,4,6.5,.1, 80,.1,.2,0,0,.03,.2,.05,7,.4,120,11,.1,.5,150],
 joghurt:["Naturjoghurt","Kühlregal",1,64,3.5,4.5,3.5,0,4.5,2.2,.1, 30,.1,.1,0,1,.04,.18,.05,10,.4,120,12,.1,.4,155],
 milch:["Vollmilch","Kühlregal",1,64,3.3,4.8,3.5,0,4.8,2.2,.1, 31,.1,.1,.3,1,.04,.18,.04,5,.4,120,12,.05,.4,150,"ml"],
 hafermilch:["Haferdrink (mit Calcium)","Kühlregal",3,45,1,7,1.5,.8,4,.2,.1, 0,1.1,.2,0,0,.03,.2,.02,3,.4,120,8,.2,.2,40,"ml"],
 olivenoel:["Olivenöl","Vorrat",2,884,0,0,100,0,0,14,0, 0,0,14,60,0,0,0,0,0,0,1,0,.6,0,1,"ml"],
 rapsoel:["Rapsöl","Vorrat",2,884,0,0,100,0,0,7,0, 0,0,17,70,0,0,0,0,0,0,0,0,0,0,0,"ml"],
 butter:["Butter","Kühlregal",2,740,.7,.6,83,0,.6,52,.03, 680,1.2,2.2,7,0,0,.02,0,3,.2,15,2,.1,.1,20],
 eb:["Erdnussbutter (100 %)","Vorrat",1,600,25,12,50,7,3,8,0, 0,0,9,.5,0,.15,.1,.45,90,0,45,170,1.9,2.9,560],
 mandelmus:["Mandelmus","Vorrat",2,630,25,5,55,10,4,4,0, 0,0,24,0,0,.2,1,.1,50,0,260,270,3.7,3.3,750],
 mandeln:["Mandeln","Nüsse & Samen",1,600,21,6,52,12,4.4,4,0, 0,0,26,0,0,.2,1.1,.14,44,0,269,270,3.7,3.1,733],
 walnuss:["Walnüsse","Nüsse & Samen",1,654,15,7,65,6.7,2.6,6.1,0, 1,0,.7,2.7,1.3,.34,.15,.54,98,0,98,158,2.9,3.1,441],
 nussmix:["Nussmix (ungesalzen)","Nüsse & Samen",1,610,18,14,53,7,4.5,6,0, 1,0,10,4,1,.4,.3,.3,50,0,130,250,3.2,3.5,650],
 cashew:["Cashewkerne","Nüsse & Samen",1,580,18,26,46,3,6,8,0, 0,0,.9,34,.5,.42,.06,.42,25,0,37,292,6.7,5.8,660],
 erdnuesse:["Erdnüsse (ungesalzen)","Nüsse & Samen",1,590,25,9,49,8,4,7,0, 0,0,8,0,0,.9,.1,.35,240,0,90,170,2,3.3,700],
 leinsamen:["Leinsamen (geschrotet)","Nüsse & Samen",1,534,18,3,42,27,1.5,3.7,0, 0,0,.3,4,.6,1.6,.16,.47,87,0,255,392,5.7,4.3,813],
 chia:["Chiasamen","Nüsse & Samen",1,486,17,8,31,34,0,3.3,0, 0,0,.5,0,1.6,.6,.17,.2,49,0,631,335,7.7,4.6,407],
 kuerbiskerne:["Kürbiskerne","Nüsse & Samen",1,560,30,5,49,6,1.4,8.7,0, 1,0,2.2,7,1.9,.27,.15,.14,58,0,46,550,8.8,7.8,809],
 sonnenblumen:["Sonnenblumenkerne","Nüsse & Samen",1,584,21,11,51,9,2.6,4.5,0, 1,0,35,0,1.4,1.5,.36,1.3,227,0,78,325,5.2,5,645],
 tahin:["Tahin","Vorrat",2,595,17,12,54,9,.5,7.5,.1, 1,0,.3,0,0,1.2,.47,.15,98,0,420,95,9,4.6,414],
 kokosmilch:["Kokosmilch","Konserven",3,180,1.8,3,18,0,3,16,0, 0,0,.2,.1,1,.03,0,.03,16,0,18,46,1.6,.7,260,"ml"],
 avocado:["Avocados","Obst & Gemüse",1,160,2,2,15,6.7,.7,2.1,0, 7,0,2.1,21,10,.07,.13,.26,81,0,12,29,.55,.64,485,[140,"Avocado","Avocados"]],
 schoko:["Zartbitterschokolade (70 %)","Süßes",4,600,8,33,43,11,24,24,0, 2,0,.6,7,0,.03,.08,.04,12,0,73,228,12,3.3,715],
 datteln:["Datteln","Obst & Gemüse",1,280,2.5,64,.4,8,63,0,0, 7,0,.05,3,.4,.05,.07,.25,15,0,64,54,1,.4,696,[8,"Dattel","Datteln"]],
 honig:["Honig","Vorrat",2,304,.3,82,0,0,82,0,0, 0,0,0,0,.5,0,.04,.02,2,0,6,2,.4,.2,52],
 kakao:["Kakaopulver (ungesüßt)","Vorrat",1,350,20,11,21,30,1,12,0, 0,0,.1,2,0,.08,.24,.12,32,0,128,499,13.9,6.8,1524],
 granola:["Granola (wenig Zucker)","Vorrat",4,450,10,62,17,8,14,3,.1, 0,0,3,3,0,.3,.1,.1,30,0,50,100,3,2,350],
 hummus:["Hummus","Kühlregal",3,240,7,14,17,6,.3,2,1, 1,0,.8,3,0,.1,.05,.2,83,0,38,71,2.4,1.8,228],
 banane:["Bananen","Obst & Gemüse",1,93,1.1,20,.2,1.7,17,.1,0, 3,0,.1,.5,9,.03,.07,.37,20,0,5,27,.3,.15,360,[120,"Banane","Bananen"]],
 apfel:["Äpfel","Obst & Gemüse",1,54,.3,12,.2,2,10,0,0, 3,0,.2,2,6,.02,.03,.04,3,0,6,5,.1,0,107,[150,"Apfel","Äpfel"]],
 birne:["Birnen","Obst & Gemüse",1,55,.4,12,.3,3,10,0,0, 1,0,.4,4,5,.03,.04,.03,7,0,9,7,.2,.1,119,[160,"Birne","Birnen"]],
 beeren:["Beerenmischung (TK)","Tiefkühl",1,45,1,7,.4,4,6,0,0, 3,0,1,15,30,.03,.04,.05,20,0,20,15,.6,.2,150],
 erdbeeren:["Erdbeeren","Obst & Gemüse",1,32,.7,5.5,.3,2,5,0,0, 1,0,.3,2,59,.02,.02,.05,24,0,16,13,.4,.1,153],
 mango:["Mango","Obst & Gemüse",1,62,.6,13,.4,1.6,12.5,.1,0, 54,0,.9,4,36,.03,.04,.12,43,0,11,10,.2,.1,170],
 kiwi:["Kiwis","Obst & Gemüse",1,61,1,10,.5,3,9,0,0, 4,0,1.5,40,70,.03,.03,.06,25,0,34,17,.3,.1,312,[75,"Kiwi","Kiwis"]],
 orange:["Orangen","Obst & Gemüse",1,47,1,9,.2,2.2,8,0,0, 11,0,.2,0,53,.09,.04,.06,30,0,40,10,.1,.1,181,[180,"Orange","Orangen"]],
 brokkoli:["Brokkoli","Obst & Gemüse",1,34,2.8,4,.4,2.6,1.7,0,0, 31,0,.8,101,89,.07,.12,.18,63,0,47,21,.7,.4,316],
 paprika:["Paprika","Obst & Gemüse",1,31,1,5,.3,2,4.2,0,0, 157,0,1.6,5,140,.05,.08,.29,46,0,7,12,.4,.25,211],
 zucchini:["Zucchini","Obst & Gemüse",1,19,1.6,2,.4,1.1,2,.1,0, 10,0,.1,4,17,.05,.09,.16,24,0,18,17,.4,.3,260],
 spinat:["Babyspinat","Obst & Gemüse",1,23,2.9,1.6,.4,2.2,.4,0,.2, 469,0,2,483,28,.08,.19,.2,194,0,99,79,2.7,.5,558],
 moehren:["Möhren","Obst & Gemüse",1,41,.9,7,.2,2.8,4.7,0,.1, 835,0,.7,13,6,.07,.06,.14,19,0,33,12,.3,.2,320],
 gbohnen:["Grüne Bohnen","Obst & Gemüse",1,31,1.8,5,.2,2.7,3.3,0,0, 35,0,.4,15,12,.08,.1,.14,33,0,37,25,1,.2,211],
 pilze:["Champignons","Obst & Gemüse",1,22,3,1,.3,1,2,0,0, 0,.2,0,0,2,.1,.4,.1,17,0,3,9,.5,.5,318],
 blumenkohl:["Blumenkohl","Obst & Gemüse",1,25,2,3,.3,2,1.9,0,0, 0,0,.1,16,48,.05,.06,.18,57,0,22,15,.4,.3,299],
 erbsen:["Erbsen (TK)","Tiefkühl",1,80,5.4,12,.4,5,5,.1,0, 38,0,.1,25,40,.27,.1,.17,65,0,25,33,1.5,1.2,244],
 kuerbis:["Hokkaido-Kürbis","Obst & Gemüse",1,49,1.7,9.7,.6,2.5,4,.1,0, 400,0,1,1,15,.05,.07,.15,25,0,20,15,.8,.2,350],
 aubergine:["Aubergine","Obst & Gemüse",1,24,1.2,2.5,.2,2.8,2.4,0,0, 2,0,0,3.5,2,.04,.04,.08,22,0,13,14,.3,.2,230],
 tomate:["Tomaten","Obst & Gemüse",1,18,.9,2.6,.2,1.2,2.6,0,0, 42,0,.5,8,14,.04,.02,.08,15,0,10,11,.3,.2,237],
 passtomate:["Passierte Tomaten","Konserven",3,35,1.5,6,.2,1.5,4.5,0,.1, 40,0,1,3,10,.04,.05,.1,12,0,15,18,.8,.2,350,"ml"],
 zwiebel:["Zwiebeln","Obst & Gemüse",1,40,1.1,8,.1,1.7,4.2,0,0, 0,0,0,0,7,.05,.03,.12,19,0,23,10,.2,.2,146,[80,"Zwiebel","Zwiebeln"]],
 mais:["Mais (Dose)","Konserven",3,80,2.5,15,1.2,2.4,4,.2,.4, 10,0,.1,0,3,.03,.05,.06,30,0,4,20,.4,.4,200],
 gurke:["Gurke","Obst & Gemüse",1,12,.6,1.8,.1,.5,1.4,0,0, 5,0,0,16,3,.02,.03,.04,7,0,16,13,.3,.2,147],
 salat:["Rucola","Obst & Gemüse",1,25,2.6,2,.7,1.6,2,.1,0, 119,0,.4,109,15,.04,.09,.07,97,0,160,47,1.5,.5,369],
 fruehlz:["Frühlingszwiebeln","Obst & Gemüse",1,32,1.8,5,.2,2.6,2.3,0,0, 50,0,.6,207,19,.06,.08,.06,64,0,72,20,1.5,.4,276],
 sojasauce:["Sojasauce","Vorrat",3,60,8,5,0,0,.4,0,14.5, 0,0,0,0,0,.05,.15,.2,18,0,20,40,1.5,.4,217,"ml"]
};
const FDK=["kcal","protein","carbs","fat","fiber","sugar","satFat","salt"];
function fdUnit(k){const u=FD[k][26];return Array.isArray(u)?u:(u||"g")}
const ffmt=n=>n%1?String(n).replace(".",","):String(n);
function ingText(k,g){
  const d=FD[k],u=fdUnit(k);
  if(Array.isArray(u)){const n=Math.max(.5,Math.round(g/u[0]*2)/2);return `${n===.5?"½":ffmt(n)} ${n<=1?u[1]:u[2]}${u[2]!==d[0]?" "+d[0]:""} (${Math.round(g/5)*5} g)`}
  return `${Math.round(g)} ${u==="ml"?"ml":"g"} ${d[0]}`;
}
function mkRecipe(cat,name,time,ings,steps,extraWhy){
  const e={name,cat,time,steps,ings:[],source:"rezeptidee"};FDK.forEach(k=>e[k]=0);
  const m={};NK.forEach(k=>m[k]=0);let novaW=0,kc=0,veg=0,legume=0,whole=0,fish=0;
  ings.forEach(it=>{
    if(typeof it[0]==="string"&&!FD[it[0]]){e.ings.push({t:it[1]?`${it[1]} ${it[0]}`:it[0],name:it[0],qty:it[1]||"",cat:it[2]||"Gewürze & Sonstiges"});return}
    const [k,g]=it, d=FD[k], f=g/100;
    FDK.forEach((key,i)=>e[key]+=d[3+i]*f);
    NK.forEach((key,i)=>m[key]+=d[11+i]*f);
    const kcal=d[3]*f;kc+=kcal;novaW+=d[2]*kcal;
    if(d[1]==="Obst & Gemüse"&&!["kartoffel","suesskart","avocado","datteln"].includes(k)||k==="beeren"||k==="erbsen"||k==="passtomate")veg+=g;
    if(["linsen","bohnen","kichererbsen","erbsen","tofu"].includes(k))legume+=g;
    if(["hafer","vkreis","quinoa","bulgur","vknudeln","vkbrot","vktoast"].includes(k))whole+=g;
    if(["lachs","lachsger","thunfisch","seelachs","garnelen"].includes(k))fish+=g;
    e.ings.push({t:ingText(k,g),name:d[0],k,g,cat:d[1]});
  });
  FDK.forEach(k=>e[k]=Math.round(e[k]*10)/10);
  NK.forEach(k=>m[k]=Math.round(m[k]*100)/100);e.micros=m;
  e.nova=Math.max(1,Math.min(4,Math.round(novaW/Math.max(kc,1))));
  let sc=localScore(e);
  if(veg>=200)sc+=.5;
  if(legume>=60)sc+=.5;if(fish>=80)sc+=.5;
  if(e.fat*9/Math.max(e.kcal,1)>.45)sc-=.5;
  e.score=Math.max(1,Math.min(10,Math.round(sc)));
  const why=[];
  if(e.protein>=40)why.push("viel Protein für den Muskelaufbau");else if(e.protein/Math.max(e.kcal,1)*100>=7)why.push("proteinreich");
  if(fish>=80)why.push("Omega-3 aus Fisch");
  if(legume>=60)why.push("pflanzliches Protein und Ballaststoffe");
  if(whole>=40)why.push("Vollkorn hält lange satt");
  if(veg>=150)why.push("viel Obst und Gemüse");
  if(e.kcal>=600&&why.length<2)why.push("kalorienreich für die Zunahme");
  if(extraWhy)why.unshift(extraWhy);
  e.why=why.slice(0,2).join(", ").replace(/^./,c=>c.toUpperCase());
  e.night=cat==="snack"&&e.protein>=12&&e.sugar<=30&&e.kcal<=600;
  return e;
}
// deterministischer Zufall, damit die Rezepte bei jedem Start gleich sind
function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,seed){const r=rng(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const FRUIT={banane:["Banane",120],beeren:["Beeren",125],erdbeeren:["Erdbeeren",150],mango:["Mango",120],apfel:["Apfel",150],birne:["Birne",160],kiwi:["Kiwi",150]};
const VEG={kuerbis:["Kürbis",250],aubergine:["Aubergine",220],brokkoli:["Brokkoli",200],paprika:["Paprika",200],zucchini:["Zucchini",200],spinat:["Spinat",120],moehren:["Möhren",200],gbohnen:["grünen Bohnen",200],pilze:["Champignons",200],blumenkohl:["Blumenkohl",220],erbsen:["Erbsen",150],tomate:["Tomaten",200]};

function genBreakfast(){
  const out=[];
  const tops={walnuss:["Walnüssen",25],mandeln:["Mandeln",25],eb:["Erdnussbutter",25],mandelmus:["Mandelmus",20],leinsamen:["Leinsamen",15],chia:["Chiasamen",15],kuerbiskerne:["Kürbiskernen",20],kakao:["Kakao",10]};
  const oats=[["Porridge","warm"],["Overnight Oats","kalt"],["Bircher-Müsli","bircher"]];
  for(const [style,kind] of oats)for(const fk in FRUIT)for(const tk in tops)for(const liq of ["milch","hafermilch"]){
    const [fn,fg]=FRUIT[fk],[tn,tg]=tops[tk];
    const ings=[["hafer",80],[liq,250],[fk,fg],[tk,tg]];
    if(tk==="kakao")ings.push(["mandeln",15]);
    if(kind==="bircher"&&fk!=="apfel")ings.push(["apfel",75]);
    if(kind==="bircher")ings.push(["joghurt",100]);
    const steps=kind==="warm"?[`Haferflocken mit ${liq==="milch"?"der Milch":"dem Haferdrink"} und einer Prise Salz aufkochen.`,"Bei kleiner Hitze 3–5 Minuten unter Rühren quellen lassen, bis es cremig ist.",`${fn} klein schneiden und darauf geben.`,`Mit ${tn} toppen, nach Geschmack Zimt darüber.`]
      :kind==="kalt"?[`Haferflocken und ${liq==="milch"?"Milch":"Haferdrink"} in einem Glas verrühren.`,"Abgedeckt über Nacht, mindestens 4 Stunden, in den Kühlschrank stellen.",`Morgens ${fn} klein schneiden und darauf geben.`,`Mit ${tn} toppen.`]
      :[`Haferflocken mit ${liq==="milch"?"Milch":"Haferdrink"} 15 Minuten oder über Nacht einweichen.`,"Apfel grob reiben und mit dem Joghurt unterrühren.",fk!=="apfel"?`${fn} klein schneiden und darauf geben.`:"Mit Zimt abschmecken.",`Mit ${tn} toppen.`];
    out.push(mkRecipe("fruh",`${style} mit ${fn} und ${tn}${liq==="hafermilch"?" (Haferdrink)":""}`,kind==="kalt"?"5 Min. + über Nacht":kind==="warm"?"10 Min.":"10 Min.",ings,steps));
  }
  const breads=[["vkbrot",100,"Vollkornbrot"],["vktoast",90,"Vollkorntoast"]];
  const spreads=[["Rührei",[["ei",180],["butter",5]],"Eier verquirlen, salzen und in Butter bei mittlerer Hitze cremig stocken lassen."],
    ["Spiegelei",[["ei",120],["olivenoel",5]],"Eier in Öl bei mittlerer Hitze braten, bis das Eiweiß fest ist."],
    ["Avocado und Ei",[["avocado",70],["ei",120]],"Eier 7 Minuten kochen. Avocado zerdrücken, mit Salz und Zitrone würzen."],
    ["Hüttenkäse",[["huettenkaese",150]],"Hüttenkäse mit Salz, Pfeffer und Kräutern würzen."],
    ["Räucherlachs und Frischkäse",[["lachsger",60],["frischkaese",30]],"Frischkäse aufstreichen und den Lachs darauf legen."],
    ["Hummus",[["hummus",80]],"Hummus dick aufstreichen."],
    ["Mozzarella",[["mozzarella",100],["olivenoel",5]],"Mozzarella in Scheiben schneiden, mit Öl beträufeln."],
    ["Feta-Creme",[["feta",60],["joghurt",50]],"Feta mit Joghurt zu einer Creme zerdrücken."],
    ["Thunfisch-Creme",[["thunfisch",100],["joghurt",40]],"Thunfisch abtropfen und mit Joghurt, Salz und Pfeffer verrühren."],
    ["Erdnussbutter und Banane",[["eb",30],["banane",120]],"Erdnussbutter aufstreichen, Banane in Scheiben darauf legen."]];
  const bveg={tomate:["Tomate",100],gurke:["Gurke",100],paprika:["Paprika",100],spinat:["Spinat",40],salat:["Rucola",30]};
  for(const [bk,bg,bn] of breads)for(const [sn,sIngs,sStep] of spreads)for(const vk in bveg){
    if(sn.startsWith("Erdnuss")&&vk!=="salat")continue;
    const [vn,vg]=bveg[vk];
    const ings=[[bk,bg],...sIngs];if(!sn.startsWith("Erdnuss"))ings.push([vk,vg]);
    const name=sn.startsWith("Erdnuss")?`${bn} mit Erdnussbutter und Banane`:`${bn} mit ${sn} und ${vn}`;
    out.push(mkRecipe("fruh",name,"10 Min.",ings,[`${bn} toasten oder frisch aufschneiden.`,sStep,sn.startsWith("Erdnuss")?"Nach Wunsch mit Zimt bestreuen.":`${vn} waschen, klein schneiden und darauf verteilen.`,"Mit Salz, Pfeffer und frischen Kräutern abschmecken."]));
  }
  const bases=[["skyr",250,"Skyr"],["quark",250,"Quark"],["griechjog",200,"Griechischer Joghurt"],["joghurt",250,"Joghurt"]];
  const crunch=[["granola",45,"Granola"],["hafer",45,"Haferflocken"],["nussmix",30,"Nüssen"],["leinsamen",15,"Leinsamen",["hafer",30]]];
  for(const [bk,bg,bn] of bases)for(const fk in FRUIT)for(const c of crunch){
    const [fn,fg]=FRUIT[fk];const ings=[[bk,bg],[fk,fg],[c[0],c[1]]];if(c[3])ings.push(c[3]);ings.push(["honig",10]);
    out.push(mkRecipe("fruh",`${bn}-Bowl mit ${fn} und ${c[2]}`,"5 Min.",ings,[`${bn} in eine Schüssel geben und glatt rühren, bei Bedarf mit einem Schuss Milch.`,`${fn} klein schneiden und darauf verteilen.`,`${c[2]} darüber streuen.`,"Mit etwas Honig süßen."]));
  }
  const ovegs=[["paprika","Paprika"],["spinat","Spinat"],["pilze","Champignons"],["tomate","Tomaten"],["zucchini","Zucchini"],["brokkoli","Brokkoli"]];
  const cheeses=[["feta",40,"Feta"],["kaese",30,"Bergkäse"],["mozzarella",50,"Mozzarella"],[null,0,""]];
  for(const [vk,vn] of ovegs)for(const [ck,cg,cn] of cheeses)for(const side of ["vkbrot","kartoffel"]){
    const ings=[["ei",180],[vk,vk==="spinat"?80:120],["olivenoel",10]];if(ck)ings.push([ck,cg]);ings.push(side==="vkbrot"?["vkbrot",100]:["kartoffel",250]);
    const name=`Omelett mit ${vn}${cn?` und ${cn}`:""}${side==="vkbrot"?" und Vollkornbrot":" und Bratkartoffeln"}`;
    const steps=[side==="kartoffel"?"Kartoffeln würfeln und in der Hälfte des Öls 12–15 Minuten goldbraun braten.":"Brot toasten.",`${vn} klein schneiden und im restlichen Öl 3 Minuten anbraten.`,"Eier mit Salz und Pfeffer verquirlen, darüber gießen und bei mittlerer Hitze stocken lassen.",cn?`${cn} darüber streuen, Omelett zusammenklappen.`:"Omelett zusammenklappen und servieren."];
    out.push(mkRecipe("fruh",name,side==="kartoffel"?"25 Min.":"12 Min.",ings,steps));
  }
  const ptops=[["eb",25,"Erdnussbutter"],["skyr",100,"Skyr"],["mandelmus",20,"Mandelmus"],["griechjog",80,"Joghurt"]];
  for(const fk of ["beeren","erdbeeren","banane","apfel","mango","kiwi"])for(const [pk,pg,pn] of ptops){
    const [fn,fg]=FRUIT[fk];
    out.push(mkRecipe("fruh",`Haferflocken-Pancakes mit ${fn} und ${pn}`,"20 Min.",[["hafer",70],["banane",120],["ei",120],["milch",60],["rapsoel",5],[pk,pg],...(fk!=="banane"?[[fk,fg]]:[])],["Haferflocken, Banane, Eier und Milch zu einem dicken Teig mixen.","Eine Pfanne mit wenig Öl erhitzen, kleine Pancakes 2 Minuten pro Seite backen.",`Mit ${pn} und ${fn} servieren.`]));
  }
  const adds=[["hafer",50,"Hafer"],["eb",20,"Erdnussbutter"],["skyr",150,"Skyr"],["mandeln",25,"Mandeln"],["datteln",24,"Datteln"]];
  for(const fk in FRUIT)for(let i=0;i<adds.length;i++)for(let j=i+1;j<adds.length;j++){
    const [fn,fg]=FRUIT[fk],a=adds[i],b=adds[j];
    out.push(mkRecipe("fruh",`${fn}-Shake mit ${a[2]} und ${b[2]}`,"5 Min.",[["milch",350],[fk,fg],[a[0],a[1]],[b[0],b[1]]],["Alle Zutaten in den Mixer geben.","30–60 Sekunden mixen, bis alles fein ist.","Sofort trinken. Ideal, wenn morgens wenig Hunger da ist."]));
  }
  // neu in 2.1: Frühstücks-Wraps, Süßkartoffel-Hash, Quinoa-Frühstücksbowls
  for(const [pk,pg,pn] of [["ei",120,"Rührei"],["huettenkaese",120,"Hüttenkäse"],["lachsger",60,"Räucherlachs"]])for(const [vk,vn] of [["spinat","Spinat"],["paprika","Paprika"],["tomate","Tomate"],["pilze","Champignons"],["salat","Rucola"]])for(const [ck,cg,cn] of [["feta",30,"Feta"],["kaese",25,"Bergkäse"],["avocado",60,"Avocado"]]){
    out.push(mkRecipe("fruh",`Frühstücks-Wrap mit ${pn}, ${vn} und ${cn}`,"10 Min.",[["wrap",60],[pk,pg],[vk,vk==="salat"?30:80],[ck,cg],["olivenoel",5]],[pk==="ei"?"Eier verquirlen und im Öl cremig stocken lassen.":`${pn} bereitstellen.`,`${vn} klein schneiden${vk==="spinat"||vk==="pilze"?" und kurz anbraten":""}.`,`Wrap kurz in der Pfanne erwärmen und mit ${pn}, ${vn} und ${cn} füllen.`,"Fest einrollen und halbieren."]));}
  for(const [vk,vn] of [["paprika","Paprika"],["spinat","Spinat"],["zucchini","Zucchini"],["pilze","Champignons"],["kuerbis","Kürbis"],["brokkoli","Brokkoli"]])for(const [pk,pg,pn] of [["ei",120,"Spiegelei"],["feta",40,"Feta"],["huettenkaese",100,"Hüttenkäse"]]){
    out.push(mkRecipe("fruh",`Süßkartoffel-Hash mit ${vn} und ${pn}`,"25 Min.",[["suesskart",250],[vk,100],[pk,pg],["olivenoel",12],["zwiebel",40]],["Süßkartoffel schälen, klein würfeln und im Öl 12–15 Minuten knusprig braten.",`Zwiebel und ${vn} klein schneiden und 4 Minuten mitbraten.`,pk==="ei"?"Eier daneben in die Pfanne schlagen und braten, bis das Eiweiß fest ist.":`${pn} darüber geben.`,"Mit Salz, Pfeffer und Paprikapulver würzen."]));}
  for(const fk in FRUIT)for(const [tk,tg,tn] of [["mandeln",20,"Mandeln"],["walnuss",20,"Walnüssen"],["eb",20,"Erdnussbutter"],["kuerbiskerne",15,"Kürbiskernen"]]){const [fn,fg]=FRUIT[fk];
    out.push(mkRecipe("fruh",`Quinoa-Frühstücksbowl mit ${fn} und ${tn}`,"20 Min.",[["quinoa",60],["milch",200],[fk,fg],[tk,tg],["honig",10]],["Quinoa heiß abspülen und in der Milch mit einer Prise Zimt 15 Minuten köcheln.",`${fn} klein schneiden.`,`Quinoa in eine Schüssel geben und mit ${fn}, ${tn} und Honig toppen.`]));}
  return out;
}

function genSnacks(){
  const out=[];
  const nuts={walnuss:"Walnüsse",mandeln:"Mandeln",nussmix:"Nussmix",cashew:"Cashewkerne",erdnuesse:"Erdnüsse",kuerbiskerne:"Kürbiskerne"};
  const fr={apfel:["Apfel",150],banane:["Banane",120],birne:["Birne",160],orange:["Orange",180],kiwi:["Kiwi",150],datteln:["Datteln",32]};
  for(const nk in nuts)for(const fk in fr){const [fn,fg]=fr[fk];
    out.push(mkRecipe("snack",`${nuts[nk]} mit ${fn}`,"2 Min.",[[nk,40],[fk,fg]],["Nüsse abwiegen, etwa zwei kleine Handvoll.",`${fn} waschen und in Stücke schneiden.`,"Tipp: Portionen für die Woche vorab in kleine Dosen füllen."]));}
  const bases=[["vkbrot",50,"Vollkornbrot"],["reiswaffel",24,"Reiswaffeln"],["vktoast",60,"Vollkorntoast"]];
  const spreads=[["eb",30,"Erdnussbutter",1],["mandelmus",25,"Mandelmus",1],["hummus",60,"Hummus",0],["huettenkaese",100,"Hüttenkäse",0],["frischkaese",30,"Frischkäse",0],["avocado",70,"Avocado",0],["kaese",30,"Bergkäse",0]];
  const sweetT=[["banane",120,"Banane"],["apfel",100,"Apfel"],["erdbeeren",80,"Erdbeeren"],["honig",8,"Honig"]];
  const savT=[["tomate",80,"Tomate"],["gurke",80,"Gurke"],["paprika",80,"Paprika"],["salat",20,"Rucola"]];
  for(const [bk,bg,bn] of bases)for(const [sk,sg,sn,sw] of spreads)for(const [tk,tg,tn] of (sw?sweetT:savT)){
    out.push(mkRecipe("snack",`${bn} mit ${sn} und ${tn}`,"5 Min.",[[bk,bg],[sk,sg],[tk,tg]],[`${bn} ${bk==="reiswaffel"?"auslegen":"toasten"}.`,`${sn} aufstreichen.`,`${tn} ${tk==="honig"?"darüber träufeln":"in Scheiben darauf legen"}.`]));}
  const cups=[["skyr",200,"Skyr"],["quark",200,"Quark"],["griechjog",150,"Griechischer Joghurt"],["joghurt",200,"Joghurt"],["huettenkaese",200,"Hüttenkäse"]];
  const cadd=[["honig",10,"Honig"],["nussmix",25,"Nüssen"],["leinsamen",12,"Leinsamen"],["kakao",6,"Kakao"],["chia",12,"Chiasamen"],["mandeln",20,"Mandeln"]];
  for(const [ck,cg,cn] of cups)for(const fk in FRUIT)for(const [ak,ag,an] of cadd){const [fn,fg]=FRUIT[fk];
    out.push(mkRecipe("snack",`${cn} mit ${fn} und ${an}`,"3 Min.",[[ck,cg],[fk,Math.round(fg*.7)],[ak,ag]],[`${cn} in ein Schälchen geben.`,`${fn} klein schneiden und unterheben.`,`Mit ${an} toppen.`]));}
  const shAdd=[["eb",20,"Erdnussbutter"],["hafer",40,"Hafer"],["kakao",10,"Kakao"],["mandelmus",20,"Mandelmus"],["datteln",24,"Datteln"]];
  for(const fk in FRUIT)for(let i=0;i<shAdd.length;i++)for(let j=i;j<shAdd.length;j++){const [fn,fg]=FRUIT[fk],a=shAdd[i],b=shAdd[j];
    const ings=[["milch",300],[fk,fg],[a[0],a[1]]];if(j!==i)ings.push([b[0],b[1]]);
    out.push(mkRecipe("snack",`${fn}-Milch mit ${a[2]}${j!==i?` und ${b[2]}`:""}`,"3 Min.",ings,["Alle Zutaten in den Mixer geben.","Kurz mixen, bis es cremig ist.","Kalt genießen."]));}
  for(const nk of ["mandeln","cashew","walnuss","erdnuesse"])for(const [xk,xg,xn] of [["kakao",8,"Kakao"],["hafer",20,"Hafer"],["chia",8,"Chia"],["kuerbiskerne",10,"Kürbiskernen"],["leinsamen",8,"Leinsamen"]]){
    out.push(mkRecipe("snack",`Energiekugeln aus Datteln, ${nuts[nk]} und ${xn}`,"15 Min.",[["datteln",48],[nk,30],[xk,xg]],["Datteln entkernen, 10 Minuten in warmem Wasser einweichen und abtropfen lassen.",`Mit ${nuts[nk]} und ${xn} im Mixer zu einer klebrigen Masse verarbeiten.`,"Zu 4 Kugeln formen. Halten gekühlt eine Woche."]));}
  const dips=[["hummus",100,"Hummus"],["huettenkaese",150,"Kräuter-Hüttenkäse"],["griechjog",120,"Joghurt-Kräuter-Dip"],["avocado",100,"Guacamole"],["frischkaese",50,"Frischkäse-Dip"]];
  for(const [dk,dg,dn] of dips)for(const [vk,vn] of [["paprika","Paprika"],["moehren","Möhren"],["gurke","Gurke"],["brokkoli","Brokkoli"]])for(const [ck,cg,cn] of [["vkbrot",50,"Vollkornbrot"],["reiswaffel",24,"Reiswaffeln"]]){
    out.push(mkRecipe("snack",`${dn} mit ${vn}-Sticks und ${cn}`,"10 Min.",[[dk,dg],[vk,150],[ck,cg]],[dk==="avocado"?"Avocado mit Zitrone, Salz und etwas Tomate zerdrücken.":dk==="griechjog"?"Joghurt mit Kräutern, Salz und etwas Knoblauch verrühren.":`${dn} in ein Schälchen geben, nach Wunsch würzen.`,`${vn} in Sticks schneiden.`,`Mit ${cn} zum Dippen servieren.`]));}
  const nk2=Object.keys(nuts);
  for(let i=0;i<nk2.length;i++)for(let j=i+1;j<nk2.length;j++)for(const [xk,xg,xn] of [["datteln",24,"Datteln"],["schoko",15,"Zartbitterschokolade"],["sonnenblumen",15,"Sonnenblumenkernen"]]){
    out.push(mkRecipe("snack",`Studentenfutter aus ${nuts[nk2[i]]}, ${nuts[nk2[j]]} und ${xn}`,"2 Min.",[[nk2[i],25],[nk2[j],25],[xk,xg]],["Alles in einer Dose mischen.","Für unterwegs portionieren, eine kleine Handvoll entspricht etwa 30 g."]));}
  for(const [vk,vn] of [["gurke","Gurke"],["tomate","Tomate"],["paprika","Paprika"],["moehren","Möhren"]])for(const [ck,cg,cn] of [["vkbrot",50,"Vollkornbrot"],["reiswaffel",24,"Reiswaffeln"]]){
    out.push(mkRecipe("snack",`Gekochte Eier mit ${vn} und ${cn}`,"10 Min.",[["ei",120],[vk,120],[ck,cg]],["Eier 8–9 Minuten kochen, abschrecken und pellen.",`${vn} in Stücke schneiden.`,`Mit ${cn}, Salz und Pfeffer essen.`]));}
  for(const [sk,sg,sn] of [["huettenkaese",100,"Hüttenkäse"],["hummus",60,"Hummus"],["frischkaese",40,"Frischkäse"],["eb",30,"Erdnussbutter"]])for(const [tk,tg,tn] of (sk==="eb"?[["banane",120,"Banane"],["apfel",100,"Apfel"],["erdbeeren",80,"Erdbeeren"]]:[["spinat",30,"Spinat"],["paprika",80,"Paprika"],["gurke",80,"Gurke"]])){
    out.push(mkRecipe("snack",`Wrap-Röllchen mit ${sn} und ${tn}`,"5 Min.",[["wrap",60],[sk,sg],[tk,tg]],[`Wrap mit ${sn} bestreichen.`,`${tn} klein schneiden und darauf verteilen.`,"Fest aufrollen und in Scheiben schneiden."]));}
  for(const fk in FRUIT)for(const [tk,tg,tn] of [["mandeln",20,"Mandeln"],["kakao",6,"Kakao"],["nussmix",20,"Nüssen"],["honig",8,"Honig"],["walnuss",20,"Walnüssen"]]){const [fn,fg]=FRUIT[fk];
    out.push(mkRecipe("snack",`Chia-Pudding mit ${fn} und ${tn}`,"5 Min. + 2 Std.",[["milch",200],["chia",25],[fk,Math.round(fg*.7)],[tk,tg]],["Chiasamen mit der Milch verrühren, nach 5 Minuten nochmal umrühren.","Mindestens 2 Stunden oder über Nacht kühlen.",`Mit ${fn} und ${tn} servieren.`]));}
  // neu in 2.1: Parfaits und Obst mit Nussmus
  for(const [bk,bg,bn] of [["skyr",150,"Skyr"],["griechjog",150,"Joghurt"],["quark",150,"Quark"]])for(const fk in FRUIT)for(const [ck,cg,cn] of [["granola",30,"Granola"],["hafer",25,"Haferflocken"],["nussmix",20,"Nüssen"]]){const [fn,fg]=FRUIT[fk];
    out.push(mkRecipe("snack",`${bn}-Parfait mit ${fn} und ${cn}`,"5 Min.",[[bk,bg],[fk,Math.round(fg*.6)],[ck,cg]],[`${bn} und ${fn} abwechselnd in ein Glas schichten.`,`Mit ${cn} abschließen.`,"Sofort essen oder abgedeckt bis zu einem Tag kühlen."]));}
  for(const fk of ["apfel","birne","banane"])for(const [mk,mg,mn] of [["eb",25,"Erdnussbutter"],["mandelmus",20,"Mandelmus"],["tahin",20,"Tahin und Honig"]]){const [fn,fg]=fr[fk];
    out.push(mkRecipe("snack",`${fn} mit ${mn}`,"2 Min.",[[fk,fg],[mk,mg],...(mk==="tahin"?[["honig",6]]:[])],[`${fn} in Spalten oder Scheiben schneiden.`,`Mit ${mn} zum Dippen servieren.`]));}
  return out;
}

// Hauptgerichte
const PROT={
 huhn:{n:"Hähnchen",c:"Hähnchen",g:160,cook:"Hähnchen in Streifen schneiden, salzen und im Öl 6–8 Minuten rundum braten, bis es innen nicht mehr rosa ist."},
 pute:{n:"Pute",c:"Puten",g:160,cook:"Putenbrust in Streifen schneiden, würzen und im Öl 6–7 Minuten braten."},
 rind:{n:"Rinderhack",c:"Rinderhack",g:150,cook:"Rinderhack im Öl krümelig anbraten und mit Salz und Pfeffer würzen."},
 rindsteak:{n:"Rindfleisch",c:"Rindfleisch",g:160,cook:"Rindfleisch in dünne Streifen schneiden und im heißen Öl 2–3 Minuten scharf anbraten."},
 lachs:{n:"Lachs",c:"Lachs",g:140,cook:"Lachs salzen und im Öl auf der Hautseite 4 Minuten braten, wenden und 2–3 Minuten fertig garen."},
 thunfisch:{n:"Thunfisch",c:"Thunfisch",g:130,cook:"Thunfisch abtropfen lassen und zum Schluss nur kurz unterheben."},
 garnelen:{n:"Garnelen",c:"Garnelen",g:160,cook:"Garnelen trocken tupfen und im Öl 2 Minuten pro Seite braten."},
 seelachs:{n:"Seelachs",c:"Seelachs",g:180,cook:"Seelachs würfeln, salzen und im Öl 4–5 Minuten vorsichtig braten."},
 tofu:{n:"Tofu",c:"Tofu",g:180,cook:"Tofu trocken tupfen, würfeln und im Öl 8 Minuten knusprig braten."},
 kichererbsen:{n:"Kichererbsen",c:"Kichererbsen",g:240,cook:"Kichererbsen abspülen, abtropfen und im Öl 5 Minuten anrösten."},
 linsen:{n:"Linsen",c:"Linsen",g:80,cook:"Rote Linsen in der doppelten Menge Wasser 10–12 Minuten weich garen."}
};
const CARB={
 reis:{n:"Reis",c:"Reis",g:85,t:20,cook:"Reis nach Packungsanleitung kochen."},
 vkreis:{n:"Vollkornreis",c:"Vollkornreis",g:85,t:35,cook:"Vollkornreis nach Packungsanleitung etwa 30 Minuten kochen."},
 quinoa:{n:"Quinoa",c:"Quinoa",g:80,t:15,cook:"Quinoa heiß abspülen und in der doppelten Menge Wasser 12–15 Minuten garen."},
 couscous:{n:"Couscous",c:"Couscous",g:80,t:10,cook:"Couscous mit der gleichen Menge kochendem Wasser übergießen und 5 Minuten quellen lassen."},
 bulgur:{n:"Bulgur",c:"Bulgur",g:80,t:15,cook:"Bulgur in der doppelten Menge Wasser 10 Minuten köcheln und quellen lassen."},
 vknudeln:{n:"Vollkornnudeln",c:"Vollkornnudel",g:115,t:15,cook:"Vollkornnudeln in Salzwasser bissfest kochen."},
 nudeln:{n:"Nudeln",c:"Nudel",g:115,t:12,cook:"Nudeln in Salzwasser bissfest kochen."},
 kartoffel:{n:"Kartoffeln",c:"Kartoffel",g:350,t:25,cook:"Kartoffeln waschen, in Würfel schneiden und in Salzwasser 15 Minuten kochen oder im Ofen rösten."},
 suesskart:{n:"Süßkartoffeln",c:"Süßkartoffel",g:300,t:25,cook:"Süßkartoffeln schälen, würfeln und 15 Minuten kochen oder im Ofen rösten."}
};
const STYLE={
 med:{a:{f:"Mediterrane",m:"Mediterraner",n:"Mediterranes"},ings:[["olivenoel",15],["Knoblauch","1 Zehe","Obst & Gemüse"],["Oregano und Basilikum","",""]],extra:k=>k==="tomate"?[["feta",40]]:[["tomate",100],["feta",40]],sauce:"Tomatensoße",sauceIngs:[["passtomate",150]],step:"Mit Knoblauch, Oregano und Basilikum würzen, Feta zerbröseln und darüber geben."},
 asia:{a:{f:"Asiatische",m:"Asiatischer",n:"Asiatisches"},ings:[["rapsoel",12],["sojasauce",20],["Ingwer","1 Stück (2 cm)","Obst & Gemüse"]],extra:()=>[["fruehlz",30],["erdnuesse",20]],sauce:"Soja-Ingwer-Soße",sauceIngs:[],step:"Ingwer fein reiben, mit Sojasauce und 2 EL Wasser verrühren und kurz mitköcheln. Mit Frühlingszwiebeln und Erdnüssen bestreuen."},
 mex:{a:{f:"Mexikanische",m:"Mexikanischer",n:"Mexikanisches"},ings:[["olivenoel",12],["Kreuzkümmel, Paprikapulver, Chili","",""],["Limette","½","Obst & Gemüse"]],extra:()=>[["bohnen",100],["mais",60]],sauce:"Tomaten-Bohnen-Soße",sauceIngs:[["passtomate",120]],step:"Bohnen und Mais abspülen, dazu geben und mit Kreuzkümmel, Paprikapulver und Chili würzen. Mit Limettensaft abschmecken."},
 ind:{a:{f:"Indische",m:"Indischer",n:"Indisches"},ings:[["rapsoel",8],["kokosmilch",120],["Currypulver","1–2 TL",""],["Ingwer","1 Stück (2 cm)","Obst & Gemüse"]],extra:()=>[["zwiebel",80]],sauce:"Curry-Kokos-Soße",sauceIngs:[],step:"Zwiebel und Ingwer anschwitzen, Currypulver 30 Sekunden mitrösten, mit Kokosmilch ablöschen und 5 Minuten köcheln."},
 orient:{a:{f:"Orientalische",m:"Orientalischer",n:"Orientalisches"},ings:[["olivenoel",12],["tahin",15],["Kreuzkümmel und Petersilie","",""],["Zitrone","½","Obst & Gemüse"]],extra:()=>[["joghurt",100]],sauce:"Joghurt-Tahin-Soße",sauceIngs:[],step:"Joghurt mit Tahin, Zitronensaft, Salz und Kreuzkümmel verrühren und darüber geben. Mit Petersilie bestreuen."},
 klass:{a:{f:"Herzhafte",m:"Herzhafter",n:"Herzhaftes"},ings:[["rapsoel",10],["Frische Kräuter","1 Bund","Obst & Gemüse"]],extra:()=>[["zwiebel",80],["milch",120],["butter",8]],sauce:"Kräuter-Rahm-Soße",sauceIngs:[],step:"Zwiebel anschwitzen, Milch und Butter dazu geben, 3 Minuten einköcheln lassen und mit Kräutern, Salz und Pfeffer abschmecken."}
};
function genMains(cat,seed){
  const formats=cat==="mittag"
    ?[["bowl",["reis","vkreis","quinoa","couscous","bulgur","suesskart"]],["pfanne",["reis","vkreis","kartoffel","suesskart","bulgur","nudeln"]],["pasta",["vknudeln","nudeln"]],["wrap",[null]],["salat",["quinoa","couscous","bulgur","kartoffel","vknudeln"]]]
    :[["blech",["kartoffel","suesskart"]],["curry",["reis","vkreis","quinoa"]],["chili",["reis","kartoffel"]],["auflauf",["nudeln","vknudeln","kartoffel"]],["pfanne",["reis","vkreis","kartoffel","suesskart","nudeln"]],["eintopf",["kartoffel"]]];
  const cands=[];
  for(const [fmt_,carbs] of formats)for(const pk in PROT)for(const ck of carbs)for(const vk in VEG)for(const sk in STYLE){
    if(fmt_==="curry"&&!["ind","asia"].includes(sk))continue;
    if(fmt_==="chili"&&sk!=="mex")continue;
    if(fmt_==="eintopf"&&!["klass","med","ind"].includes(sk))continue;
    if(fmt_==="auflauf"&&!["med","klass"].includes(sk))continue;
    if(fmt_==="blech"&&["thunfisch","linsen","rind"].includes(pk))continue;
    if(fmt_==="wrap"&&["linsen","seelachs"].includes(pk))continue;
    if(fmt_==="salat"&&["ind","klass"].includes(sk))continue;
    if((fmt_==="chili"||fmt_==="eintopf")&&["lachs","garnelen","seelachs","thunfisch"].includes(pk))continue;
    if(sk==="mex"&&pk==="kichererbsen"&&false)continue;
    cands.push([fmt_,pk,ck,vk,sk]);
  }
  shuffle(cands,seed);
  const out=[],names=new Set();
  for(const [f,pk,ck,vk,sk] of cands){
    if(out.length>=700)break;
    const P=PROT[pk],C=ck?CARB[ck]:null,V=VEG[vk],S=STYLE[sk];
    let name;
    if(f==="bowl")name=`${S.a.f} ${P.c}-${C.c}-Bowl mit ${V[0]}`;
    else if(f==="pfanne")name=`${S.a.f} ${P.c}-Pfanne mit ${V[0]} und ${C.n}`;
    else if(f==="pasta")name=`${C.n} mit ${P.n}, ${V[0]} und ${S.sauce}`;
    else if(f==="wrap")name=`${S.a.f} ${P.c}-Wraps mit ${V[0]}`;
    else if(f==="salat")name=`${S.a.m} ${C.c}-Salat mit ${P.n} und ${V[0]}`;
    else if(f==="blech")name=`${S.a.f} ${P.c}-${C.c}-Blech mit ${V[0]}`;
    else if(f==="curry")name=`${sk==="asia"?"Thai-":""}${P.c}-Curry mit ${V[0]} und ${C.n}`;
    else if(f==="chili")name=`${P.c}-Chili mit ${V[0]} und ${C.n}`;
    else if(f==="auflauf")name=`${S.a.m} ${P.c}-${C.c}-Auflauf mit ${V[0]}`;
    else name=`${S.a.m} ${P.c}-Eintopf mit ${V[0]} und Kartoffeln`;
    name=name.replace("Rinderhack-Bowl","Hackfleisch-Bowl").replace(/\s+/g," ");
    if(names.has(name))continue;names.add(name);
    const ings=[];
    if(C)ings.push([ck,C.g]);else ings.push(["wrap",120]);
    ings.push([pk,P.g]);
    ings.push([vk,V[1]]);
    S.ings.forEach(i=>ings.push(i));
    S.extra(vk).forEach(i=>{if(!ings.some(x=>x[0]===i[0])&&i[0]!==pk)ings.push(i)});
    if(f==="pasta"||f==="auflauf"||f==="chili"||f==="eintopf")S.sauceIngs.forEach(i=>{if(!ings.some(x=>x[0]===i[0]))ings.push(i)});
    if(f==="chili"&&!ings.some(x=>x[0]==="passtomate"))ings.push(["passtomate",150]);
    if(f==="auflauf")ings.push(["kaese",40]);
    if(f==="eintopf")ings.push(["moehren",100]);
    if(f==="salat")ings.push(["salat",30]);
    const t=Math.max(C?C.t:5,pk==="linsen"?15:8)+(f==="blech"||f==="auflauf"?20:f==="eintopf"||f==="chili"?15:8);
    const steps=[];
    if(C)steps.push(C.cook.replace("Kartoffeln waschen, in Würfel schneiden und in Salzwasser 15 Minuten kochen oder im Ofen rösten.",f==="blech"?"Ofen auf 200 °C vorheizen. Kartoffeln waschen und würfeln.":C.cook).replace("Süßkartoffeln schälen, würfeln und 15 Minuten kochen oder im Ofen rösten.",f==="blech"?"Ofen auf 200 °C vorheizen. Süßkartoffeln schälen und würfeln.":C.cook));
    if(f==="blech"){
      steps.push(`${C.n}, ${V[0]} und ${P.n} auf einem Blech verteilen, mit dem Öl und Gewürzen mischen.`);
      steps.push(`Etwa 25 Minuten backen, ${["lachs","seelachs","garnelen"].includes(pk)?"den Fisch erst nach 10 Minuten dazulegen":"zwischendurch einmal wenden"}.`);
      steps.push(S.step);
    }else if(f==="auflauf"){
      steps.push(P.cook);steps.push(`${V[0]} klein schneiden und 3 Minuten mitbraten.`);
      steps.push(`Mit ${C.n} und der ${S.sauce} in einer Auflaufform mischen, Käse darüber streuen.`);
      steps.push("Bei 200 °C etwa 20 Minuten überbacken, bis der Käse goldbraun ist.");
    }else if(f==="wrap"){
      steps.push(P.cook);steps.push(`${V[0]} in Streifen schneiden und kurz mitbraten.`);steps.push(S.step);
      steps.push("Wraps kurz in der Pfanne erwärmen, füllen und fest einrollen.");
    }else if(f==="salat"){
      steps.push(P.cook);steps.push(`${V[0]} klein schneiden${vk==="spinat"?"":" und kurz anbraten oder roh verwenden"}.`);
      steps.push(`${C.n} mit Gemüse, ${P.n} und Rucola mischen.`);steps.push(S.step);
    }else{
      steps.push(P.cook);
      steps.push(`${V[0]} klein schneiden und ${f==="chili"||f==="eintopf"||f==="curry"?"mitkochen":"4–5 Minuten mitbraten"}.`);
      if(f==="chili")steps.push("Passierte Tomaten dazu geben und 15 Minuten köcheln lassen.");
      if(f==="eintopf")steps.push("Möhren und Kartoffeln dazu geben, mit 400 ml Wasser auffüllen und 20 Minuten köcheln.");
      if(f==="pasta")steps.push(`Für die ${S.sauce} die Soßenzutaten in der Pfanne aufkochen und alles mit den Nudeln mischen.`);
      steps.push(S.step);
      if(f==="bowl")steps.push(`${C.n} in eine Schüssel geben und alles darauf anrichten.`);
    }
    out.push(mkRecipe(cat,name,`${Math.round(t/5)*5} Min.`,ings,steps));
  }
  return out;
}
// Rezepte werden erst erzeugt, wenn eine Kategorie gebraucht wird
const GEN={};
function genPool(cat){
  if(GEN[cat])return GEN[cat];
  const raw=cat==="fruh"?genBreakfast():cat==="snack"?genSnacks():genMains(cat,cat==="mittag"?11:29);
  const seen=new Set();
  GEN[cat]=raw.filter(r=>{if(seen.has(r.name))return false;seen.add(r.name);return true});
  GEN[cat].forEach((r,i)=>r.id=cat+i);
  return GEN[cat];
}
function genAll(){const t0=Date.now();["fruh","mittag","abend","snack"].forEach(genPool);GEN.ms=Date.now()-t0;return GEN}

