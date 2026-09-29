const screens=[...document.querySelectorAll('.screen')];
const rail=[...document.querySelectorAll('.rail-step')];
const progressWrap=document.querySelector('.progress-wrap');
const progressBar=document.querySelector('#progressBar');
const progressText=document.querySelector('#progressText');
const stepText=document.querySelector('#stepText');

const keys={
  completed:'ifap_etude_v2_completed',
  current:'ifap_etude_v2_current',
  challenge:'ifap_etude_v2_challenge'
};
const completed=new Set(JSON.parse(localStorage.getItem(keys.completed)||'[]'));
let current=localStorage.getItem(keys.current)||'s0';
if(!document.getElementById(current)) current='s0';

function sectionIndex(id){return Number(id.replace('s',''));}
function persistCompleted(){localStorage.setItem(keys.completed,JSON.stringify([...completed]));}
function markComplete(id){completed.add(sectionIndex(id));persistCompleted();updateProgress();}

function updateProgress(){
  const pct=Math.round((completed.size/screens.length)*100);
  progressBar.style.width=`${pct}%`;
  progressText.textContent=`${pct} %`;
  progressWrap.setAttribute('aria-valuenow',String(pct));
  rail.forEach((button,i)=>button.classList.toggle('done',completed.has(i)));
}

function show(id,{focusHeading=true}={}){
  const target=document.getElementById(id);
  if(!target)return;
  screens.forEach(screen=>screen.classList.toggle('active-screen',screen.id===id));
  rail.forEach(button=>{
    const active=button.dataset.go===id;
    button.classList.toggle('active',active);
    if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
  });
  current=id;
  localStorage.setItem(keys.current,id);
  const index=sectionIndex(id);
  stepText.textContent=`Étape ${index+1} sur ${screens.length}`;
  updateProgress();
  window.scrollTo({top:0,behavior:'smooth'});
  const activeRail=rail.find(button=>button.dataset.go===id);
  activeRail?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  if(focusHeading){
    const heading=target.querySelector('h1,h2');
    if(heading){
      heading.setAttribute('tabindex','-1');
      window.setTimeout(()=>heading.focus({preventScroll:true}),220);
    }
  }
}

rail.forEach(button=>button.addEventListener('click',()=>show(button.dataset.go)));
document.querySelectorAll('.next').forEach(button=>button.addEventListener('click',()=>{
  markComplete(current);
  show(button.dataset.next);
}));
document.querySelectorAll('.prev').forEach(button=>button.addEventListener('click',()=>show(button.dataset.prev)));

function setButtonState(button,state){
  button.classList.remove('selected','correct','wrong');
  if(state)button.classList.add(...state.split(' '));
}

function choiceActivity(activity){
  const feedback=activity.querySelector('.feedback');
  activity.querySelectorAll('.choices button').forEach(button=>button.addEventListener('click',()=>{
    activity.querySelectorAll('.choices button').forEach(item=>{
      setButtonState(item,'');
      item.setAttribute('aria-pressed','false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed','true');
    if(button.dataset.correct==='true'){
      button.classList.add('correct');
      feedback.className='feedback ok';
      const texts={
        a1:'Exact. « Expliquer le lien » demande de montrer comment un phénomène agit sur l’autre : ici, une relation de cause à effet.',
        a4:'Oui. Au brouillon, quelques mots-clés suffisent : vous préparez vos idées sans rédiger deux fois.',
        a5:'Oui. Cette réponse répond immédiatement à « pourquoi ? » et fait apparaître deux conséquences économiques.',
        a6:'Oui. Deux actions précises suffisent ici : la réponse est courte mais complète.',
        a7:'Oui. Il est prioritaire de traiter la question encore blanche et fortement valorisée, puis d’améliorer le reste si le temps le permet.'
      };
      feedback.textContent=texts[activity.dataset.activity]||'Bonne réponse.';
    }else{
      button.classList.add('wrong');
      feedback.className='feedback ko';
      const texts={
        a1:'Revenez au verbe « expliquer » et au mot « lien » : il faut rendre visible une relation, pas seulement définir ou recopier.',
        a4:'Ce brouillon vous ferait perdre du temps. Cherchez quelques mots-clés qui vous permettront ensuite de rédiger.',
        a5:'Cette réponse parle du sujet mais ne répond pas réellement à « pourquoi est-ce un problème économique ? ».',
        a6:'Cette réponse est soit trop générale, soit insuffisante. Cherchez deux actions précises, sans développement inutile.',
        a7:'Dans cette situation, une question à 5 points est encore totalement blanche : commencez par sécuriser ces points.'
      };
      feedback.textContent=texts[activity.dataset.activity]||'Réessayez.';
    }
  }));
}
document.querySelectorAll('.activity').forEach(activity=>{
  if(activity.querySelector('.choices'))choiceActivity(activity);
});

const match=document.querySelector('[data-activity="a2"]');
match.querySelectorAll('.match-row').forEach(row=>{
  row.querySelectorAll('button').forEach(button=>{
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{
      row.querySelectorAll('button').forEach(item=>{
        setButtonState(item,'');
        item.setAttribute('aria-pressed','false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-pressed','true');
    });
  });
});
match.querySelector('.check-match').addEventListener('click',()=>{
  let ok=0,answered=0;
  match.querySelectorAll('.match-row').forEach(row=>{
    row.querySelectorAll('button').forEach(button=>button.classList.remove('correct','wrong'));
    const selected=row.querySelector('button.selected');
    if(!selected)return;
    answered++;
    const right=selected.textContent.trim()===row.dataset.answer;
    selected.classList.add(right?'correct':'wrong');
    if(right)ok++;
  });
  const feedback=match.querySelector('.feedback');
  if(answered<3){
    feedback.className='feedback ko';
    feedback.textContent='Classez les trois questions avant de vérifier.';
  }else if(ok===3){
    feedback.className='feedback ok';
    feedback.textContent='Exact. Une même épreuve peut combiner D, D+ et C : identifiez la source avant de chercher.';
  }else{
    feedback.className='feedback ko';
    feedback.textContent='Pas tout à fait. D = information présente ; D+ = information à relier ou expliquer ; C = apport extérieur au document.';
  }
});

const selectActivity=document.querySelector('[data-activity="a3"]');
selectActivity.querySelectorAll('.text-select').forEach(item=>{
  item.setAttribute('aria-pressed','false');
  item.addEventListener('click',()=>{
    item.classList.toggle('selected');
    item.setAttribute('aria-pressed',item.classList.contains('selected')?'true':'false');
  });
});
selectActivity.querySelector('.check-select').addEventListener('click',()=>{
  let good=0,bad=0;
  selectActivity.querySelectorAll('.text-select').forEach(item=>{
    item.classList.remove('good','bad');
    if(item.classList.contains('selected')){
      if(item.dataset.good==='1'){item.classList.add('good');good++;}
      else{item.classList.add('bad');bad++;}
    }
  });
  const feedback=selectActivity.querySelector('.feedback');
  if(good===2&&bad===0){
    feedback.className='feedback ok';
    feedback.textContent='Exact. Vous avez retenu uniquement les deux limites demandées.';
  }else if(good===2&&bad>0){
    feedback.className='feedback ko';
    feedback.textContent='Vous avez trouvé les bonnes informations, mais vous avez aussi retenu un élément qui ne répond pas à la question. Sélectionner, c’est aussi laisser de côté.';
  }else{
    feedback.className='feedback ko';
    feedback.textContent='Il manque au moins une information utile. Cherchez ce qui constitue réellement une difficulté pour les usagers.';
  }
});

const challengeTextareas=[...document.querySelectorAll('#challenge textarea')];
const savedChallenge=JSON.parse(localStorage.getItem(keys.challenge)||'[]');
challengeTextareas.forEach((textarea,index)=>{
  if(savedChallenge[index])textarea.value=savedChallenge[index];
  textarea.addEventListener('input',()=>{
    localStorage.setItem(keys.challenge,JSON.stringify(challengeTextareas.map(item=>item.value)));
  });
});

const correctionButton=document.querySelector('#showCorrection');
const challengeFeedback=document.querySelector('#challengeFeedback');
correctionButton.addEventListener('click',()=>{
  const filled=challengeTextareas.filter(textarea=>textarea.value.trim().length>8).length;
  if(filled<4){
    challengeFeedback.textContent=`Complétez les 4 réponses avant de comparer (${filled}/4 renseignées).`;
    challengeTextareas.find(textarea=>textarea.value.trim().length<=8)?.focus();
    return;
  }
  challengeFeedback.textContent='';
  document.querySelector('#correction').classList.remove('hidden');
  document.querySelector('#correction').scrollIntoView({behavior:'smooth',block:'start'});
});

const completeButton=document.querySelector('#completeModule');
const completeMessage=document.querySelector('#completeMsg');
completeButton.addEventListener('click',()=>{
  markComplete('s8');
  const remaining=screens.length-completed.size;
  completeMessage.classList.remove('hidden');
  completeMessage.textContent=remaining===0
    ?'Module terminé. Vous pouvez maintenant utiliser la fiche méthode pendant vos prochains entraînements.'
    :`Cette étape est terminée. Il vous reste ${remaining} étape${remaining>1?'s':''} à parcourir pour compléter le module.`;
});

document.querySelector('#restart').addEventListener('click',()=>{
  Object.values(keys).forEach(key=>localStorage.removeItem(key));
  location.reload();
});

show(current,{focusHeading:false});