const BUSINESS_RESET_HOUR = 4;

// ==========================
// グローバル変数
// ==========================

let currentDate = new Date();

let touchStartX = 0;
let touchEndX = 0;

let isRainy = false;

let selectedHistoryDate = null;

let historyRainy = false;

let historyOffDay = false;


// ==========================
// 共通処理
// ==========================

function formatAnalysisDate(date){

  if(!date){
    return "";
  }


  const d = new Date(date);


  if(isNaN(d.getTime())){
    return "";
  }


  return (
    String(d.getFullYear()).slice(2)
    + "/"
    + (d.getMonth()+1)
    + "/"
    + d.getDate()
  );

}

function getHistory(){

  return JSON.parse(
    localStorage.getItem("deliveryHistory") || "[]"
  );

}

function saveHistory(history){

  localStorage.setItem(
    "deliveryHistory",
    JSON.stringify(history)
  );

}


// ==========================
// ページ切替
// ==========================

function switchPage(page){

  document.querySelectorAll(".page")
  .forEach(p=>p.classList.remove("active"));

  document.querySelectorAll(".nav-btn")
  .forEach(b=>b.classList.remove("active"));

  if(page==="home"){

  document
    .getElementById("homePage")
    .classList.add("active");

  document
    .getElementById("homeTab")
    .classList.add("active");

  renderHomeProgress();

}

  if(page==="today"){

  document
    .getElementById("todayPage")
    .classList.add("active");

  document
    .getElementById("todayTab")
    .classList.add("active");

}

  if(page==="history"){

  document
    .getElementById("historyPage")
    .classList.add("active");

  document
    .getElementById("historyTab")
    .classList.add("active");

  renderCalendar();

  showHistoryDetail(
    getSelectedHistoryDate()
    || getBusinessDateKey()
  );

}

  if(page==="analysis"){

  document
    .getElementById("analysisPage")
    .classList.add("active");

  document
    .getElementById("analysisTab")
    .classList.add("active");

}

  if(page==="settings"){

  document
    .getElementById("settingsPage")
    .classList.add("active");

  document
    .getElementById("settingsTab")
    .classList.add("active");

}

}

function toggleRain(){

  isRainy = !isRainy;

  const buttons = [
    document.getElementById("rainToggleBtn"),
    document.getElementById("rainToggleBtn2")
  ];

  buttons.forEach(btn=>{

    if(!btn) return;

    if(isRainy){

      btn.classList.add("active");

    }else{

      btn.classList.remove("active");

    }

    btn.innerText = "☔";

  });


  saveCurrentData();

}

function toggleHistoryOffDay(){

  historyOffDay = !historyOffDay;

  const btn =
    document.getElementById("historyOffBtn");


  if(historyOffDay){

    btn.classList.add("active");
    btn.innerText = "休";

  }else{

    btn.classList.remove("active");
    btn.innerText = "休";

  }

}

function toggleHistoryRain(){

  historyRainy = !historyRainy;

  const btn =
    document.getElementById("historyRainBtn");

 if(historyRainy){

  btn.classList.add("active");
  btn.innerText = "☔";

}else{

  btn.classList.remove("active");
  btn.innerText = "☔";

}

}


function getNumber(id){
  return Number(document.getElementById(id).value || 0);
}

function getBusinessDateKey(){

  const selected =
    document.getElementById("businessDate").value;

  if(selected){
    return selected;
  }

  const now = new Date();

  if(now.getHours() < BUSINESS_RESET_HOUR){
    now.setDate(now.getDate() - 1);
  }

  return `${now.getFullYear()}-${
    String(now.getMonth()+1).padStart(2,"0")
  }-${
    String(now.getDate()).padStart(2,"0")
  }`;

}

function formatGoalInput(){

  const input =
    document.getElementById("dailyGoal");

  const value =
    input.value.replace(/,/g,"");

  if(value === "") return;

  input.value =
    Number(value).toLocaleString();

}

function removeGoalComma(){

  const input =
    document.getElementById("dailyGoal");

  input.value =
    input.value.replace(/,/g,"");

}

function calculateResults(){

  const totalCount =
    getNumber("uberCount") +
    getNumber("demaeCount") +
    getNumber("rocketCount");

  const totalSales =
    getNumber("uberSales") +
    getNumber("demaeSales") +
    getNumber("rocketSales");

  document.getElementById("todaySales")
.innerText = "¥ " + totalSales.toLocaleString();

  document.getElementById("totalCount")
  .innerText = totalCount;

  let unitPrice = 0;

  if(totalCount > 0){
    unitPrice = Math.round(totalSales / totalCount);
  }

  document.getElementById("unitPrice")
  .innerText = unitPrice.toLocaleString();

/* =======================
目標進捗
======================= */

const goal =
  Number(
    document.getElementById("dailyGoal").value
      .replace(/,/g,"")
  ) || 0;

const salesCard =
  document.getElementById("salesCard");

if(goal > 0){

 let percent =
  Math.floor((totalSales / goal) * 100);

// 表示用
document.getElementById("goalPercent")
.innerText = `${percent}%`;

// バー用（100%以上にしない）
let barPercent = percent;

if(barPercent > 100){
  barPercent = 100;
}

document.getElementById("goalProgressFill")
.style.width = `${barPercent}%`;

  const remaining =
    goal - totalSales;

  if(remaining > 0){

    document.getElementById("remainingText")
    .innerText =
      `あと${remaining.toLocaleString()}円`;

    salesCard.classList.remove(
      "sales-goal-achieved"
    );

  }else{

    document.getElementById("remainingText")
    .innerText =
      "目標達成！";

    salesCard.classList.add(
      "sales-goal-achieved"
    );

  }

}else{

  document.getElementById("goalPercent")
  .innerText = "0%";

  document.getElementById("remainingText")
  .innerText = "あと0円";

  document.getElementById("goalProgressFill")
  .style.width = "0%";

  salesCard.classList.remove(
    "sales-goal-achieved"
  );

}

  calculateWorkTime();

  saveCurrentData();


}

function clearInput(id){

  document.getElementById(id).value = "";

  calculateResults();

}

function calculateWorkTime(){

  let totalMinutes = 0;

  for(let i=1;i<=3;i++){

    const start =
      document.getElementById(`start${i}`).value;

    const end =
      document.getElementById(`end${i}`).value;

    if(start){

      const s = start.split(":");

      const sm =
        Number(s[0]) * 60 + Number(s[1]);

      let em;

      if(end){

        const e = end.split(":");

        em =
          Number(e[0]) * 60 + Number(e[1]);

      }else{

        const now = new Date();

        em =
          now.getHours() * 60 +
          now.getMinutes();

      }

      // 日跨ぎ対応
      if(em < sm){
        em += 24 * 60;
      }

      totalMinutes += em - sm;

    }

  }

  const hours = totalMinutes / 60;

  const h = Math.floor(hours);
  const m = totalMinutes % 60;

  document.getElementById("workTime").innerText =
    `${h}時間 ${m}分`;

  const totalSales =
    getNumber("uberSales") +
    getNumber("demaeSales") +
    getNumber("rocketSales");

  const totalCount =
    getNumber("uberCount") +
    getNumber("demaeCount") +
    getNumber("rocketCount");

  const hourly =
    hours > 0
    ? Math.round(totalSales / hours)
    : 0;

  document.getElementById("hourlyPay").innerText =
    hourly.toLocaleString();

  const perHour =
    hours > 0
    ? totalCount / hours
    : 0;

  document.getElementById("deliveryPerHour").innerText =
    perHour.toFixed(2);

  saveCurrentData();

}


function startWork(){

  const now = new Date();

  const time =
    String(now.getHours()).padStart(2,"0")
    + ":" +
    String(now.getMinutes()).padStart(2,"0");

  for(let i=1;i<=3;i++){

    const start =
      document.getElementById(`start${i}`);

    const end =
      document.getElementById(`end${i}`);

    if(start.value === ""){

      start.value = time;
      break;

    }

    if(start.value !== "" && end.value === ""){
      alert("未終了の稼働があります");
      return;
    }

  }

  calculateWorkTime();

}

function endWork(){

  const ok =
    confirm("現在の稼働を停止しますか？");

  if(!ok) return;

  const now = new Date();

  const time =
    String(now.getHours()).padStart(2,"0")
    + ":" +
    String(now.getMinutes()).padStart(2,"0");

  for(let i=1;i<=3;i++){

    const start =
      document.getElementById(`start${i}`);

    const end =
      document.getElementById(`end${i}`);

    if(start.value !== "" && end.value === ""){

      end.value = time;
      break;

    }

  }

  calculateWorkTime();

}

function clearAllData(){

  const ok =
    confirm("内容をクリアしますか？");

  if(!ok) return;

  localStorage.removeItem("deliveryCurrentData");

  location.reload();

}

function finishWork(){

  const ok =
    confirm("本日の内容を実績へ保存しますか？");

  if(!ok) return;

  const dateKey = getBusinessDateKey();

  let history = getHistory();

  const totalSales =
    getNumber("uberSales") +
    getNumber("demaeSales") +
    getNumber("rocketSales");

  const totalCount =
    getNumber("uberCount") +
    getNumber("demaeCount") +
    getNumber("rocketCount");

  let hourly = 0;

  const workText =
    document.getElementById("workTime").innerText;

  const match =
    workText.match(/(\d+)時間\s(\d+)分/);

  if(match){

    const h = Number(match[1]);
    const m = Number(match[2]);

    const totalHours = h + (m / 60);

    if(totalHours > 0){
      hourly = Math.round(totalSales / totalHours);
    }

  }

  const data = {

    date:dateKey,

    totalSales,
    totalCount,

    workTime:workText,

   hourly,

deliveryPerHour:
  document.getElementById("deliveryPerHour").innerText,

    uberCount:getNumber("uberCount"),
    uberSales:getNumber("uberSales"),

    demaeCount:getNumber("demaeCount"),
    demaeSales:getNumber("demaeSales"),

    rocketCount:getNumber("rocketCount"),
    rocketSales:getNumber("rocketSales"),

start1:
  document.getElementById("start1").value,

end1:
  document.getElementById("end1").value,

start2:
  document.getElementById("start2").value,

end2:
  document.getElementById("end2").value,

start3:
  document.getElementById("start3").value,

end3:
  document.getElementById("end3").value,

memo:
  document.getElementById("memo").value,

isRainy:isRainy,
isOffDay:false,
  };

  const index =
    history.findIndex(h=>h.date===dateKey);

  if(index >= 0){

    history[index] = data;

  }else{

    history.push(data);

  }

  saveHistory(history);

  alert("実績へ保存しました");

localStorage.removeItem("deliveryCurrentData");

location.reload();

}

function saveCurrentData(){

  const data = {

    uberCount:
      document.getElementById("uberCount").value,

    uberSales:
      document.getElementById("uberSales").value,

    demaeCount:
      document.getElementById("demaeCount").value,

    demaeSales:
      document.getElementById("demaeSales").value,

    rocketCount:
      document.getElementById("rocketCount").value,

    rocketSales:
      document.getElementById("rocketSales").value,

dailyGoal:
  document.getElementById("dailyGoal").value
    .replace(/,/g,""),

    memo:
      document.getElementById("memo").value,

    start1:
      document.getElementById("start1").value,

    end1:
      document.getElementById("end1").value,

    start2:
      document.getElementById("start2").value,

    end2:
      document.getElementById("end2").value,

    start3:
      document.getElementById("start3").value,

    end3:
  document.getElementById("end3").value,

isRainy:isRainy,

  };

  localStorage.setItem(
    "deliveryCurrentData",
    JSON.stringify(data)
  );

}

function loadCurrentData(){

  const saved =
    localStorage.getItem("deliveryCurrentData");

  if(!saved) return;

  const data = JSON.parse(saved);

  const card =
  document.getElementById(
    "workStatusCard"
  );

if(card){

  const isMini =
    localStorage.getItem(
      "workStatusCardMini"
    );

  if(isMini==="true"){

    card.classList.add("mini");

  }else{

    card.classList.remove("mini");

  }

}

isRainy = data.isRainy || false;

const btn =
  document.getElementById("rainToggleBtn");

if(isRainy){

  btn.classList.add("active");
  btn.innerText = "☔";

}

  Object.keys(data).forEach(key=>{

    const el =
      document.getElementById(key);

    if(el){
      el.value = data[key];
    }

  });

    formatGoalInput();
  calculateResults();

  console.log(
    "mini after load:",
    card.classList.contains("mini")
  );

}

function createCountOptions(){

  [
    "uberCount",
    "demaeCount",
    "rocketCount"
  ].forEach(id=>{

    const select =
      document.getElementById(id);

    if(!select) return;

    select.innerHTML = "";

    // 未選択
    const blank =
      document.createElement("option");

    blank.value = "";
    blank.textContent = "";

    select.appendChild(blank);

    // 0～99
    for(let i=0;i<=99;i++){

      const option =
        document.createElement("option");

      option.value = i;
      option.textContent = i;

      select.appendChild(option);

    }

  });

}


function changeMonth(value){

  currentDate.setMonth(
    currentDate.getMonth() + value
  );

  renderCalendar();
  renderMonthlyGoal();
updateMonthlyGoalProgress();

}

function renderCalendar(){

  const grid =
    document.getElementById("calendarGrid");

  grid.innerHTML = "";

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  document.getElementById("calendarTitle")
  .innerText =
    `${year}年 ${month+1}月`;

  const history = getHistory();

  let monthTotal = 0;

  history.forEach(h=>{

    const d = new Date(h.date);

    if(
      d.getFullYear() === year &&
      d.getMonth() === month
    ){
      monthTotal += Number(h.totalSales || 0);
    }

  });

 document.getElementById("monthTotal")
  .innerText =
    `¥${monthTotal.toLocaleString()}`;

  const days =
  ["月","火","水","木","金","土","日"];

  days.forEach((day,index)=>{

  const el =
    document.createElement("div");

  let className = "day-name";

  // 月曜始まり
  // index=5 → 土
  // index=6 → 日

  if(index === 5){
    className += " saturday";
  }

  if(index === 6){
    className += " sunday";
  }

  el.className = className;
  el.innerText = day;

  grid.appendChild(el);

});

  let firstDay =
  new Date(year,month,1).getDay();

firstDay =
  firstDay === 0 ? 6 : firstDay - 1;

  const lastDate =
    new Date(year,month+1,0).getDate();

  for(let i=0;i<firstDay;i++){

    const blank =
      document.createElement("div");

    grid.appendChild(blank);

  }

  for(let d=1; d<=lastDate; d++){

    const dateKey =
      `${year}-${
        String(month+1).padStart(2,"0")
      }-${
        String(d).padStart(2,"0")
      }`;
    
    const activeDate =
  selectedHistoryDate || getBusinessDateKey();

    const historyData =
      history.find(h=>h.date===dateKey);

    const day =
      document.createElement("div");

    day.className = "calendar-day";

    if(dateKey === activeDate){
  day.classList.add("active");
}

    const dayOfWeek =
  new Date(year, month, d).getDay();

let dayClass = "";

if(dayOfWeek === 0){
  dayClass = "sunday";
}

if(dayOfWeek === 6){
  dayClass = "saturday";
}

day.innerHTML =
`
<div class="day-number ${dayClass}">
${d}
${historyData?.isRainy ? "☔" : ""}
${historyData?.isOffDay ? "休" : ""}
</div>

<div class="day-sales">
${
  historyData && !historyData.isOffDay
  ? Number(historyData.totalSales).toLocaleString()
  : ""
}
</div>

<div class="day-count">
${
  historyData && !historyData.isOffDay
  ? `${historyData.totalCount}件`
  : ""
}
</div>
`;

    day.onclick = ()=>{

  selectedHistoryDate = dateKey;

  document
  .querySelectorAll(".calendar-day")
  .forEach(el=>el.classList.remove("active"));

  day.classList.add("active");

  showHistoryDetail(dateKey);

};

    grid.appendChild(day);

  }

}



function showHistoryDetail(dateKey){

  const history = getHistory();

  let data =
    history.find(h=>h.date===dateKey);

  if(!data){

    data = {
      totalSales:"",
      totalCount:"",
      workTime:"",
      hourly:"",
      deliveryPerHour:"",
      uberCount:"",
      uberSales:"",
      demaeCount:"",
      demaeSales:"",
      rocketCount:"",
      rocketSales:"",
      memo:"",
      uberBase:"",
uberPromotion:"",
uberTip:"",
uberOther:"",
    };

  }

  const dateObj = new Date(dateKey);

  document.getElementById("detailDate")
  .innerText =
    `${dateObj.getFullYear()}年${
      dateObj.getMonth()+1
    }月${
      dateObj.getDate()
    }日`;

  document.getElementById("historyTotalSales").innerText =
  (data.totalSales || 0).toLocaleString()

document.getElementById("historyTotalCount").innerText =
  data.totalCount || 0;

  const match =
  (data.workTime || "")
  .match(/(\d+)時間\s(\d+)分/);

if(match){

  document.getElementById("historyWorkHour").value =
    match[1];

  document.getElementById("historyWorkMinute").value =
    match[2];

}else{

  document.getElementById("historyWorkHour").value = "";
  document.getElementById("historyWorkMinute").value = "";

}

  document.getElementById("historyHourly").innerText =
  Number(data.hourly || 0).toLocaleString();

document.getElementById("historyDeliveryPerHour").innerText =
  data.deliveryPerHour || 0;

  document.getElementById("historyUnitPrice").innerText =
  data.totalCount
    ? Math.round(data.totalSales / data.totalCount).toLocaleString()
    : 0;

  document.getElementById("historyUberCount").value =
    data.uberCount || "";

  document.getElementById("historyUberSales").value =
    data.uberSales || "";

  document.getElementById("historyDemaeCount").value =
    data.demaeCount || "";

  document.getElementById("historyDemaeSales").value =
    data.demaeSales || "";

  document.getElementById("historyRocketCount").value =
    data.rocketCount || "";

  document.getElementById("historyRocketSales").value =
    data.rocketSales || "";

  document.getElementById("historyUberBase").value =
  data.uberBase || "";

document.getElementById("historyUberPromotion").value =
  data.uberPromotion || "";

document.getElementById("historyUberTip").value =
  data.uberTip || "";

document.getElementById("historyUberOther").value =
  data.uberOther || "";

  document.getElementById("historyMemo").value =
  data.memo || "";

// 追加
calculateHistoryDetail();

historyRainy = data.isRainy || false;

const rainBtn =
  document.getElementById("historyRainBtn");

if(historyRainy){

  rainBtn.classList.add("active");
  rainBtn.innerText = "☔";

}else{

  rainBtn.classList.remove("active");
  rainBtn.innerText = "☔";

}

  // 非稼働状態復元

historyOffDay =
  data.isOffDay || false;

const offBtn =
  document.getElementById("historyOffBtn");


if(historyOffDay){

  offBtn.classList.add("active");
  offBtn.innerText = "休";

}else{

  offBtn.classList.remove("active");
  offBtn.innerText = "休";

}

} // ← showHistoryDetail を閉じる

function clearHistoryInputs(){

  document.getElementById("detailDate").innerText =
    "日付を選択してください";

  const ids = [

    "historyTotalSales",
    "historyTotalCount",

    "historyWorkHour",
    "historyWorkMinute",

    "historyHourly",
    "historyDeliveryPerHour",
    "historyUnitPrice",

    "historyUberCount",
    "historyUberSales",

    "historyDemaeCount",
    "historyDemaeSales",

    "historyRocketCount",
    "historyRocketSales",

    "historyMemo"

  ];

  ids.forEach(id=>{

    document.getElementById(id).value = "";

  });

}

function calculateHistoryDetail(){

  const uberCount =
    Number(document.getElementById("historyUberCount").value || 0);

  const uberSales =
    Number(document.getElementById("historyUberSales").value || 0);

  const demaeCount =
    Number(document.getElementById("historyDemaeCount").value || 0);

  const demaeSales =
    Number(document.getElementById("historyDemaeSales").value || 0);

  const rocketCount =
    Number(document.getElementById("historyRocketCount").value || 0);

  const rocketSales =
    Number(document.getElementById("historyRocketSales").value || 0);

  // 合計件数
  const totalCount =
    uberCount +
    demaeCount +
    rocketCount;

  // 合計売上
  const totalSales =
    uberSales +
    demaeSales +
    rocketSales;

  document.getElementById("historyTotalCount").innerText =
  totalCount;

  document.getElementById("historyTotalSales").innerText =
  totalSales.toLocaleString();

  // 稼働時間
  const hour =
    Number(document.getElementById("historyWorkHour").value || 0);

  const minute =
    Number(document.getElementById("historyWorkMinute").value || 0);

  const totalHours =
    hour + (minute / 60);

  // 時給換算
  let hourly = 0;

  if(totalHours > 0){
    hourly = Math.round(totalSales / totalHours);
  }

  document.getElementById("historyHourly").innerText =
  hourly.toLocaleString();

let deliveryPerHour = 0;

if(totalHours > 0){
  deliveryPerHour =
    (totalCount / totalHours).toFixed(2);
}

document.getElementById("historyDeliveryPerHour").innerText =
  deliveryPerHour;

let unitPrice = 0;

if(totalCount > 0){

  unitPrice =
    Math.round(totalSales / totalCount);

}

document.getElementById("historyUnitPrice").innerText =
  unitPrice.toLocaleString();

}

function getSelectedHistoryDate(){

  const dateText =
    document.getElementById("detailDate").innerText;

  if(dateText === "日付を選択してください"){
    return null;
  }

  const match =
    dateText.match(/(\d+)年(\d+)月(\d+)日/);

  if(!match) return null;

  return `${match[1]}-${
    String(match[2]).padStart(2,"0")
  }-${
    String(match[3]).padStart(2,"0")
  }`;

}

function saveHistoryDetail(){

  const targetDate = getSelectedHistoryDate();

  if(!targetDate){
    alert("日付を選択してください");
    return;
  }

  let history = getHistory();
  
  const oldData =
  history.find(h => h.date === targetDate) || {};
  
  const newData = {

    date: targetDate,

    totalSales:
  Number(
    document.getElementById("historyTotalSales")
      .innerText
      .replace(/,/g,"")
  ),

    totalCount:
  Number(
    document.getElementById("historyTotalCount")
      .innerText
  ),

    workTime:
      `${document.getElementById("historyWorkHour").value || 0}時間 ${
        document.getElementById("historyWorkMinute").value || 0
      }分`,

    hourly:
  Number(
    document.getElementById("historyHourly")
      .innerText
      .replace(/,/g,"")
  ),
    
deliveryPerHour:
  Number(
    document.getElementById("historyDeliveryPerHour")
      .innerText
  ),

    uberCount:
      document.getElementById("historyUberCount").value,

    uberSales:
      document.getElementById("historyUberSales").value,

    demaeCount:
      document.getElementById("historyDemaeCount").value,

    demaeSales:
      document.getElementById("historyDemaeSales").value,

    rocketCount:
      document.getElementById("historyRocketCount").value,

    rocketSales:
  document.getElementById("historyRocketSales").value,
    
uberBase:
  document.getElementById("historyUberBase").value,

uberPromotion:
  document.getElementById("historyUberPromotion").value,

uberTip:
  document.getElementById("historyUberTip").value,

uberOther:
  document.getElementById("historyUberOther").value,

memo:
  document.getElementById("historyMemo").value,

start1:
  oldData.start1 || "",

end1:
  oldData.end1 || "",

start2:
  oldData.start2 || "",

end2:
  oldData.end2 || "",

start3:
  oldData.start3 || "",
    
end3:
  oldData.end3 || "",

isRainy: historyRainy,

isOffDay: historyOffDay,

  };

  const index =
    history.findIndex(h => h.date === targetDate);

  if(index >= 0){

    history[index] = newData;

  }else{

    history.push(newData);

  }

  saveHistory(history);
  
  renderCalendar();
showHistoryDetail(targetDate);
renderAnalysis();

  alert("保存しました");

}

function clearHistoryDetail(){

  const ok =
    confirm("この日の内容を削除しますか？");

  if(!ok) return;

  const dateText =
    document.getElementById("detailDate").innerText;

  if(dateText === "日付を選択してください"){
    return;
  }

  const match =
    dateText.match(/(\d+)年(\d+)月(\d+)日/);

  if(!match) return;

  const targetDate =
    `${match[1]}-${
      String(match[2]).padStart(2,"0")
    }-${
      String(match[3]).padStart(2,"0")
    }`;

  let history = getHistory();

  history =
    history.filter(h => h.date !== targetDate);

  localStorage.setItem(
    "deliveryHistory",
    JSON.stringify(history)
  );

  renderCalendar();
clearHistoryInputs();
renderAnalysis();


  alert("削除しました");

}

let analysisType = "week";
let analysisRangeStart = "";
let analysisRangeEnd = "";
let weekViewMode = "analysis";
let analysisDate = new Date();

document.getElementById("businessDate").value =
  getBusinessDateKey();

createCountOptions();

loadCurrentData();

renderCalendar();

renderAnalysis();


function changeAnalysisType(type){

  analysisType = type;

  document
    .querySelectorAll("#analysisPage .rain-btn")
    .forEach(btn=>btn.classList.remove("active"));

  if(type === "year"){
    document
      .getElementById("analysisYearBtn")
      .classList.add("active");
  }

  if(type === "month"){
    document
      .getElementById("analysisMonthBtn")
      .classList.add("active");
  }

  if(type === "week"){
    document
      .getElementById("analysisWeekBtn")
      .classList.add("active");
  }

if(type === "all"){

  document
    .getElementById("analysisAllBtn")
    .classList.add("active");

}

  if(type === "range"){

  document
    .getElementById("analysisRangeBtn")
    .classList.add("active");

}
 
  renderAnalysis();

}

function changeWeekViewMode(mode){

  weekViewMode = mode;

  const analysisRadio =
    document.getElementById("analysisRadio");

  const listRadio =
    document.getElementById("listRadio");

  const analysisBtn =
    document.getElementById("weekAnalysisViewBtn");

  const listBtn =
    document.getElementById("weekListViewBtn");

  if(mode === "analysis"){

    analysisRadio.innerText = "●";
    listRadio.innerText = "○";

    analysisBtn.style.color = "#111827";
    listBtn.style.color = "#6b7280";

  }else{

    analysisRadio.innerText = "○";
    listRadio.innerText = "●";

    analysisBtn.style.color = "#6b7280";
    listBtn.style.color = "#111827";

  }

  renderAnalysis();

}

function moveAnalysisPeriod(value){

  if(analysisType === "all"){
    return;
  }


  if(analysisType === "year"){

    analysisDate.setFullYear(
      analysisDate.getFullYear() + value
    );

  }

  if(analysisType === "month"){

    analysisDate.setMonth(
      analysisDate.getMonth() + value
    );

  }

  if(analysisType === "week"){

    analysisDate.setDate(
      analysisDate.getDate() + (7 * value)
    );

  }

  renderAnalysis();

}

function goCurrentAnalysisPeriod(){

  analysisDate = new Date();

  renderAnalysis();

}

function goCurrentMonth(){

  currentDate = new Date();

  renderCalendar();

  const today = new Date();

  const todayKey =
    `${today.getFullYear()}-${
      String(today.getMonth()+1).padStart(2,"0")
    }-${
      String(today.getDate()).padStart(2,"0")
    }`;

  // 今日の実績を表示
  showHistoryDetail(todayKey);

  // カレンダー上の青枠を今日へ移動
  document
    .querySelectorAll(".calendar-day")
    .forEach(el=>el.classList.remove("active"));

  document
    .querySelectorAll(".calendar-day")
    .forEach(day=>{

      const numEl =
        day.querySelector(".day-number");

      if(!numEl) return;

      const dayNumber =
        parseInt(numEl.innerText);

      if(dayNumber === today.getDate()){

        day.classList.add("active");

      }

    });

}

function renderAnalysis(){

  const weekViewArea =
    document.getElementById(
      "weekViewModeArea"
    );

  if(analysisType === "week"){

    weekViewArea.style.display = "flex";

  }else{

    weekViewArea.style.display = "none";

  }

  const rangeArea =
  document.getElementById(
    "analysisRangeArea"
  );


if(analysisType === "range"){

  rangeArea.style.display = "block";

}else{

  rangeArea.style.display = "none";

}

  const history = getHistory();

  const now = analysisDate;

  const normalArea =
  document.getElementById(
    "analysisNormalArea"
  );

const listArea =
  document.getElementById(
    "analysisListArea"
  );

if(
  analysisType === "week" &&
  weekViewMode === "list"
){

  normalArea.style.display = "none";
  listArea.style.display = "block";

}else{

  normalArea.style.display = "block";
  listArea.style.display = "none";

}

if(
  analysisType === "week" &&
  weekViewMode === "list"
){

  renderAnalysisList(history);

  return;

}
  
  let filtered = [];

  if(analysisType === "year"){

    filtered = history.filter(h=>{

      const d = new Date(h.date);

      return d.getFullYear() === now.getFullYear();

    });

    document.getElementById(
      "analysisPeriodLabel"
    ).innerText =
      `${now.getFullYear()}年`;

document.getElementById(
  "analysisServicePeriod"
).innerText =
  `${now.getFullYear()}年`;

    document.getElementById(
  "weekdayTitle"
).innerText =
  `${now.getFullYear()}年（平日）`;

document.getElementById(
  "weekendTitle"
).innerText =
  `${now.getFullYear()}年（土日）`;

  }

  if(analysisType === "month"){

    filtered = history.filter(h=>{

      const d = new Date(h.date);

      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );

    });

    document.getElementById(
      "analysisPeriodLabel"
    ).innerText =
      `${now.getFullYear()}年 ${now.getMonth()+1}月`;

document.getElementById(
  "analysisServicePeriod"
).innerText =
  `${now.getFullYear()}年 ${now.getMonth()+1}月`;

    document.getElementById(
  "weekdayTitle"
).innerText =
  `${now.getFullYear()}年 ${now.getMonth()+1}月（平日）`;

document.getElementById(
  "weekendTitle"
).innerText =
  `${now.getFullYear()}年 ${now.getMonth()+1}月（土日）`;

  }

  if(analysisType === "week"){

    const today = analysisDate;

    const day = today.getDay();

    const monday = new Date(today);

    monday.setDate(
      today.getDate() - (day === 0 ? 6 : day - 1)
    );

    monday.setHours(0,0,0,0);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    sunday.setHours(23,59,59,999);

    filtered = history.filter(h=>{

      const d = new Date(h.date);

      return d >= monday && d <= sunday;

    });

    document.getElementById(
      "analysisPeriodLabel"
    ).innerText =
      `${monday.getMonth()+1}/${monday.getDate()}〜${sunday.getMonth()+1}/${sunday.getDate()}`;

document.getElementById(
  "analysisServicePeriod"
).innerText =
  `${monday.getMonth()+1}/${monday.getDate()}〜${sunday.getMonth()+1}/${sunday.getDate()}`;

    document.getElementById(
  "weekdayTitle"
).innerText =
  `${monday.getMonth()+1}/${monday.getDate()}〜${sunday.getMonth()+1}/${sunday.getDate()}（平日）`;

document.getElementById(
  "weekendTitle"
).innerText =
  `${monday.getMonth()+1}/${monday.getDate()}〜${sunday.getMonth()+1}/${sunday.getDate()}（土日）`;

  }

if(analysisType === "all"){

  filtered = history;

  document.getElementById(
    "analysisPeriodLabel"
  ).innerText = "累計";

  document.getElementById(
    "analysisServicePeriod"
  ).innerText = "累計";

  document.getElementById(
  "weekdayTitle"
).innerText =
  "累計（平日）";

document.getElementById(
  "weekendTitle"
).innerText =
  "累計（土日）";

}

if(analysisType === "range"){

  filtered = history.filter(h=>{

    const d = new Date(h.date);

    const start =
      new Date(analysisRangeStart);

    const end =
      new Date(analysisRangeEnd);

    end.setHours(
      23,
      59,
      59,
      999
    );


    return (
      d >= start &&
      d <= end
    );

  });


  document.getElementById(
  "analysisPeriodLabel"
).innerText =
  `${formatAnalysisDate(analysisRangeStart)}〜${formatAnalysisDate(analysisRangeEnd)}`;


  document.getElementById(
  "analysisServicePeriod"
).innerText =
  `${formatAnalysisDate(analysisRangeStart)}〜${formatAnalysisDate(analysisRangeEnd)}`;


  document.getElementById(
  "weekdayTitle"
).innerText =
  `${formatAnalysisDate(analysisRangeStart)}〜${formatAnalysisDate(analysisRangeEnd)}（平日）`;


  document.getElementById(
  "weekendTitle"
).innerText =
  `${formatAnalysisDate(analysisRangeStart)}〜${formatAnalysisDate(analysisRangeEnd)}（土日）`;

}
  
  const workDays =
  filtered.filter(
    h => !h.isOffDay
  ).length;

  // 平日・土日データ抽出
const weekdayFiltered = filtered.filter(h => {
  const day = new Date(h.date).getDay();
  return day >= 1 && day <= 5;   // 月～金
});

const weekendFiltered = filtered.filter(h => {
  const day = new Date(h.date).getDay();
  return day === 0 || day === 6; // 日・土
});

  // ======================
// 平日集計用
// ======================

let weekdaySales = 0;
let weekdayCount = 0;
let weekdayHours = 0;

let weekdayMaxSales = 0;
let weekdayMinSales = null;
let weekdayMaxPerHour = 0;

// ======================
// 土日集計用
// ======================

let weekendSales = 0;
let weekendCount = 0;
let weekendHours = 0;

let weekendMaxSales = 0;
let weekendMinSales = null;
let weekendMaxPerHour = 0;

  let totalSales = 0;
  let totalCount = 0;
  let totalHours = 0;

  let uberCount = 0;
  let uberSales = 0;

  let demaeCount = 0;
  let demaeSales = 0;

  let rocketCount = 0;
  let rocketSales = 0;

  let maxSales = 0;
  let minSales = null;

  let maxPerHour = 0;

  filtered.forEach(h=>{

    if(h.isOffDay){
  return;
} 
    const sales =
      Number(h.totalSales || 0);

    const count =
      Number(h.totalCount || 0);

    totalSales += sales;
    totalCount += count;

    uberCount += Number(h.uberCount || 0);
    uberSales += Number(h.uberSales || 0);

    demaeCount += Number(h.demaeCount || 0);
    demaeSales += Number(h.demaeSales || 0);

    rocketCount += Number(h.rocketCount || 0);
    rocketSales += Number(h.rocketSales || 0);

    if(maxSales === 0 || sales > maxSales){
      maxSales = sales;
    }

    if(minSales === null || sales < minSales){
      minSales = sales;
    }

   const timeMatch =
  (h.workTime || "")
  .match(/(\d+)時間\s*(\d+)分/);


if(timeMatch){

  const hours =
    Number(timeMatch[1])
    +
    Number(timeMatch[2]) / 60;


  totalHours += hours;


  if(hours > 0){

    const perHour =
      count / hours;


        if(perHour > maxPerHour){
      maxPerHour = perHour;
    }

  }

}

});
  

weekdayFiltered.forEach(h=>{

    if(h.isOffDay){
  return;
}

  const sales =
    Number(h.totalSales || 0);

  const count =
    Number(h.totalCount || 0);

  weekdaySales += sales;
  weekdayCount += count;

  if(weekdayMaxSales === 0 || sales > weekdayMaxSales){
    weekdayMaxSales = sales;
  }

  if(weekdayMinSales === null || sales < weekdayMinSales){
    weekdayMinSales = sales;
  }

  const match =
    (h.workTime || "")
    .match(/(\d+)時間\s(\d+)分/);

  if(match){

    const hour =
      Number(match[1]);

    const minute =
      Number(match[2]);

    const hours =
      hour + (minute / 60);

    weekdayHours += hours;

    if(hours > 0){

      const perHour =
        count / hours;

      if(perHour > weekdayMaxPerHour){
        weekdayMaxPerHour = perHour;
      }

    }

  }

});

    weekendFiltered.forEach(h=>{

      if(h.isOffDay){
  return;
}
  const sales =
    Number(h.totalSales || 0);

  const count =
    Number(h.totalCount || 0);

  weekendSales += sales;
  weekendCount += count;

  if(weekendMaxSales === 0 || sales > weekendMaxSales){
    weekendMaxSales = sales;
  }

  if(weekendMinSales === null || sales < weekendMinSales){
    weekendMinSales = sales;
  }

  const match =
    (h.workTime || "")
    .match(/(\d+)時間\s(\d+)分/);

  if(match){

    const hour =
      Number(match[1]);

    const minute =
      Number(match[2]);

    const hours =
      hour + (minute / 60);

    weekendHours += hours;

    if(hours > 0){

      const perHour =
        count / hours;

      if(perHour > weekendMaxPerHour){
        weekendMaxPerHour = perHour;
      }

    }

  }

});

  const avgSales =
    workDays > 0
    ? Math.round(totalSales / workDays)
    : 0;

  const avgHourly =
    totalHours > 0
    ? Math.round(totalSales / totalHours)
    : 0;

  const avgPerHour =
    totalHours > 0
    ? (totalCount / totalHours).toFixed(2)
    : "0.00";

  const avgPerDay =
    workDays > 0
    ? (totalCount / workDays).toFixed(1)
    : "0.0";

  const unitPrice =
  totalCount > 0
  ? Math.round(totalSales / totalCount)
  : 0;


const weekdayWorkDays =
  weekdayFiltered.filter(
    h => !h.isOffDay
  ).length;


const weekendWorkDays =
  weekendFiltered.filter(
    h => !h.isOffDay
  ).length;


const weekdayAvgSales =
  weekdayWorkDays > 0
  ? Math.round(weekdaySales / weekdayWorkDays)
  : 0;
  
const weekdayAvgHourly =
  weekdayHours > 0
  ? Math.round(weekdaySales / weekdayHours)
  : 0;

const weekdayAvgPerHour =
  weekdayHours > 0
  ? (weekdayCount / weekdayHours).toFixed(2)
  : "0.00";

const weekdayAvgPerDay =
  weekdayWorkDays > 0
  ? (weekdayCount / weekdayWorkDays).toFixed(1)
  : "0.0";

const weekdayUnitPrice =
  weekdayCount > 0
  ? Math.round(weekdaySales / weekdayCount)
  : 0;


const weekendAvgSales =
  weekendWorkDays > 0
  ? Math.round(weekendSales / weekendWorkDays)
  : 0;

const weekendAvgHourly =
  weekendHours > 0
  ? Math.round(weekendSales / weekendHours)
  : 0;

const weekendAvgPerHour =
  weekendHours > 0
  ? (weekendCount / weekendHours).toFixed(2)
  : "0.00";

const weekendAvgPerDay =
  weekendWorkDays > 0
  ? (weekendCount / weekendWorkDays).toFixed(1)
  : "0.0";

const weekendUnitPrice =
  weekendCount > 0
  ? Math.round(weekendSales / weekendCount)
  : 0;

  document.getElementById("analysisWorkDays").innerText =
    workDays;

  document.getElementById("analysisTotalSales").innerText =
    totalSales.toLocaleString();

  document.getElementById("analysisTotalHours").innerText =
    totalHours.toFixed(1);

  document.getElementById("analysisTotalCount").innerText =
    totalCount;

  document.getElementById("analysisMaxSales").innerText =
    maxSales.toLocaleString();

  document.getElementById("analysisMinSales").innerText =
    (minSales ?? 0).toLocaleString();

  document.getElementById("analysisAvgSales").innerText =
    avgSales.toLocaleString();

  document.getElementById("analysisAvgHourly").innerText =
    avgHourly.toLocaleString();

  document.getElementById("analysisAvgPerHour").innerText =
    avgPerHour;

  document.getElementById("analysisMaxPerHour").innerText =
    maxPerHour.toFixed(2);

  document.getElementById("analysisAvgPerDay").innerText =
    avgPerDay;

  document.getElementById("analysisUnitPrice").innerText =
    unitPrice.toLocaleString();

  document.getElementById("analysisUberCount").innerText =
    uberCount;

  document.getElementById("analysisUberSales").innerText =
    uberSales.toLocaleString();

  document.getElementById("analysisUberUnit").innerText =
    uberCount > 0
    ? Math.round(uberSales / uberCount).toLocaleString()
    : 0;

  document.getElementById("analysisDemaeCount").innerText =
    demaeCount;

  document.getElementById("analysisDemaeSales").innerText =
    demaeSales.toLocaleString();

  document.getElementById("analysisDemaeUnit").innerText =
    demaeCount > 0
    ? Math.round(demaeSales / demaeCount).toLocaleString()
    : 0;

  document.getElementById("analysisRocketCount").innerText =
    rocketCount;

  document.getElementById("analysisRocketSales").innerText =
    rocketSales.toLocaleString();

  document.getElementById("analysisRocketUnit").innerText =
    rocketCount > 0
    ? Math.round(rocketSales / rocketCount).toLocaleString()
    : 0;

  document.getElementById("analysisAllCount").innerText =
    totalCount.toLocaleString();

  document.getElementById("analysisAllSales").innerText =
    totalSales.toLocaleString();

  document.getElementById("analysisAllUnit").innerText =
  totalCount > 0
  ? Math.round(totalSales / totalCount).toLocaleString()
  : 0;

  document.getElementById("weekdaySummary").innerHTML = `
<div class="result-grid">

  <div class="result-item">
    <div class="result-label">稼働日数</div>
    <div class="result-value">${weekdayWorkDays}</div>
    <div class="result-unit">日</div>
  </div>

  <div class="result-item">
    <div class="result-label">売上合計</div>
    <div class="result-value blue">${weekdaySales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">稼働時間合計</div>
    <div class="result-value">${weekdayHours.toFixed(1)}</div>
    <div class="result-unit">時間</div>
  </div>

  <div class="result-item">
    <div class="result-label">配達件数合計</div>
    <div class="result-value">${weekdayCount}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">最大売上</div>
    <div class="result-value">${weekdayMaxSales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">最小売上</div>
    <div class="result-value">${(weekdayMinSales ?? 0).toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均売上</div>
    <div class="result-value">${weekdayAvgSales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均時給</div>
    <div class="result-value blue">${weekdayAvgHourly.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均件数/時間</div>
    <div class="result-value">${weekdayAvgPerHour}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">最高件数/時間</div>
    <div class="result-value">${weekdayMaxPerHour.toFixed(2)}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均件数/日</div>
    <div class="result-value">${weekdayAvgPerDay}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均1件単価</div>
    <div class="result-value">${weekdayUnitPrice.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

</div>
`;

document.getElementById("weekendSummary").innerHTML = `
<div class="result-grid">

  <div class="result-item">
    <div class="result-label">稼働日数</div>
    <div class="result-value">${weekendWorkDays}</div>
    <div class="result-unit">日</div>
  </div>

  <div class="result-item">
    <div class="result-label">売上合計</div>
    <div class="result-value blue">${weekendSales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">稼働時間合計</div>
    <div class="result-value">${weekendHours.toFixed(1)}</div>
    <div class="result-unit">時間</div>
  </div>

  <div class="result-item">
    <div class="result-label">配達件数合計</div>
    <div class="result-value">${weekendCount}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">最大売上</div>
    <div class="result-value">${weekendMaxSales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">最小売上</div>
    <div class="result-value">${(weekendMinSales ?? 0).toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均売上</div>
    <div class="result-value">${weekendAvgSales.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均時給</div>
    <div class="result-value blue">${weekendAvgHourly.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均件数/時間</div>
    <div class="result-value">${weekendAvgPerHour}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">最高件数/時間</div>
    <div class="result-value">${weekendMaxPerHour.toFixed(2)}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均件数/日</div>
    <div class="result-value">${weekendAvgPerDay}</div>
    <div class="result-unit">件</div>
  </div>

  <div class="result-item">
    <div class="result-label">平均1件単価</div>
    <div class="result-value">${weekendUnitPrice.toLocaleString()}</div>
    <div class="result-unit">円</div>
  </div>

</div>
`;  

// ↓ここから追加

const prevBtn =
  document.getElementById("analysisPrevBtn");

const nextBtn =
  document.getElementById("analysisNextBtn");

if(
  analysisType === "all" ||
  analysisType === "range"
){

  prevBtn.classList.add(
    "analysis-arrow-disabled"
  );

  nextBtn.classList.add(
    "analysis-arrow-disabled"
  );

  prevBtn.innerText = "－";
  nextBtn.innerText = "－";

}else{

  prevBtn.classList.remove(
    "analysis-arrow-disabled"
  );

  nextBtn.classList.remove(
    "analysis-arrow-disabled"
  );

  prevBtn.innerText = "◀";
  nextBtn.innerText = "▶";

}

// ↑ここまで追加
}


/* =======================
スワイプ操作
======================= */

const historySwipeArea =
  document.querySelector(".history-calendar-wrap");

historySwipeArea.addEventListener("touchstart", e=>{

  touchStartX = e.changedTouches[0].screenX;

});

historySwipeArea.addEventListener("touchend", e=>{

  touchEndX = e.changedTouches[0].screenX;

  handleSwipe("history");

});

const analysisSwipeArea =
  document.getElementById("analysisPage");


analysisSwipeArea.addEventListener("touchstart", e=>{

  touchStartX = e.changedTouches[0].screenX;

});


analysisSwipeArea.addEventListener("touchend", e=>{

  touchEndX = e.changedTouches[0].screenX;

  if(
  analysisType === "week" &&
  weekViewMode === "list"
){
  return;
}

  handleSwipe("analysis");

});

function createWeekChart(days){

  const weekDays =
    ["月","火","水","木","金","土","日"];


  const salesData =
    weekDays.map((day,index)=>{

      let result = {
        uber:0,
        demae:0,
        rocket:0
      };


      days.forEach(h=>{

        const date =
          new Date(h.date);

        const dayIndex =
          date.getDay() === 0
          ? 6
          : date.getDay() - 1;


        if(dayIndex === index){

          result.uber +=
            Number(h.uberSales || 0);

          result.demae +=
            Number(h.demaeSales || 0);

          result.rocket +=
            Number(h.rocketSales || 0);

        }

      });


      result.total =
        result.uber +
        result.demae +
        result.rocket;


      return result;

    });



  const maxSales =
    Math.max(
      ...salesData.map(d=>d.total),
      1
    );



  return weekDays.map((day,index)=>{


    const data =
      salesData[index];


    const totalHeight =
      data.total > 0
      ? Math.round(
          data.total / maxSales * 80
        )
      : 5;


    const ratio =
      data.total > 0
      ? totalHeight / data.total
      : 0;



    return `

<div
style="
flex:1;
text-align:center;
"
>


<div
style="
height:80px;
display:flex;
align-items:flex-end;
justify-content:center;
"
>


<div
style="
width:12px;
height:${totalHeight}px;
display:flex;
flex-direction:column-reverse;
border-radius:3px;
overflow:hidden;
"
>


<div
title="Uber ${data.uber.toLocaleString()}円"
style="
height:${Math.round(data.uber * ratio)}px;
background:#22c55e;
"
></div>


<div
title="出前館 ${data.demae.toLocaleString()}円"
style="
height:${Math.round(data.demae * ratio)}px;
background:#ef4444;
"
></div>


<div
title="ロケット ${data.rocket.toLocaleString()}円"
style="
height:${Math.round(data.rocket * ratio)}px;
background:#f97316;
"
></div>


</div>


</div>



<div
style="
font-size:10px;
color:#6b7280;
margin-top:4px;
"
>
${day}
</div>


</div>


`;

  }).join("");

}

function renderHomeProgress(){

  const area =
    document.getElementById(
      "homeProgressArea"
    );

  area.innerHTML = `

<div
style="
margin-top:12px;
"
>

<div
style="
width:100%;
height:22px;
background:#e5e7eb;
border-radius:999px;
overflow:hidden;
"
>

<div
id="homeProgressBar"
style="
width:0%;
height:100%;
background:#2563eb;
display:flex;
align-items:center;
justify-content:center;
color:white;
font-weight:700;
font-size:12px;
transition:.25s;
"
>

0%

</div>

</div>

<div
style="
margin-top:12px;
text-align:center;
font-size:22px;
font-weight:700;
"
id="homeProgressSales"
>

¥0 / ¥0

</div>

</div>

`;

const summary =
  getCurrentMonthSummary();

  document.getElementById(
  "homeProgressBar"
).style.width =
  summary.percent + "%";

document.getElementById(
  "homeProgressBar"
).innerText =
  summary.percent + "%";

document.getElementById(
  "homeProgressSales"
).innerHTML =
`
¥${summary.totalSales.toLocaleString()} /
<span
id="homeGoalButton"
style="
color:#2563eb;
cursor:pointer;
text-decoration:underline;
"
>
¥${summary.goal.toLocaleString()}
</span>
`;
  
  const targetArea =
  document.getElementById(
    "homeProgressArea"
  );

targetArea.innerHTML += `

<div
style="
margin-top:20px;
padding-top:15px;
border-top:1px solid #e5e7eb;
"
>

<div
style="
margin-top:20px;
margin-bottom:18px;
padding:16px;
background:#f8fafc;
border:1px solid #e5e7eb;
border-radius:12px;
text-align:center;
"
>

<div
style="
font-size:13px;
color:#6b7280;
margin-bottom:6px;
"
>
月末予測売上
</div>

<div
style="
font-size:28px;
font-weight:700;
color:#2563eb;
"
>
¥${summary.forecastSales.toLocaleString()}
</div>

</div>

<div
style="
font-size:14px;
font-weight:700;
margin-bottom:10px;
"
>
目標達成まで
</div>


<div
style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:8px;
"
>


<div class="result-item">

<div class="result-label">
残り売上
</div>

<div class="result-value">
${summary.remainingSales.toLocaleString()}
</div>

<div class="result-unit">
円
</div>

</div>

<div class="result-item">

<div class="result-label">
必要件数
</div>

<div class="result-value">
${summary.remainingCount}
</div>

<div class="result-unit">
件
</div>

</div>

<div class="result-item">

<div class="result-label">
残り日数
</div>

<div class="result-value">
${summary.remainingDays}
</div>

<div class="result-unit">
日
</div>

</div>

<div class="result-item">

<div class="result-label">
件数/日
</div>

<div class="result-value blue">
${summary.needCountPerDay}
</div>

<div class="result-unit">
件
</div>

</div>


<div class="result-item">

<div class="result-label">
必要売上/日
</div>

<div class="result-value blue">
${summary.needSalesPerDay.toLocaleString()}
</div>

<div class="result-unit">
円
</div>

</div>

<div class="result-item">

<div class="result-label">
必要稼働時間
</div>

<div class="result-value blue">
${
  summary.needWorkHoursPerDay > 0
  ? summary.needWorkHoursPerDay
  : "-"
}
</div>

<div class="result-unit">
時間/日
</div>


</div>

`;

 document.getElementById(
  "homeGoalButton"
).onclick =
  openGoalManageModal; 

}

function renderAnalysisList(history){

  const area =
    document.getElementById(
      "analysisListArea"
    );

  if(!area) return;


  if(history.length === 0){

    area.innerHTML =
      "<div class='card'>データがありません</div>";

    return;

  }


  // =======================
  // 週単位へまとめる
  // =======================

  const weeks = {};


  history.forEach(h=>{


    if(h.isOffDay){
      return;
    }


    const date =
      new Date(h.date);


    // 月曜日を取得

    const day =
      date.getDay();


    const monday =
      new Date(date);


    monday.setDate(
      date.getDate() -
      (day === 0 ? 6 : day - 1)
    );


    monday.setHours(
      0,0,0,0
    );


    const key =
      monday.toISOString()
      .split("T")[0];


    if(!weeks[key]){

      weeks[key] = {

        monday:monday,

        sales:0,

        count:0,

        days:[]

      };

    }


    weeks[key].sales +=
      Number(h.totalSales || 0);


    weeks[key].count +=
      Number(h.totalCount || 0);


    weeks[key].days.push(h);


  });



  // =======================
  // 新しい週を上に表示
  // =======================


  const weekList =
    Object.values(weeks)
    .sort(
      (a,b)=>
      b.monday - a.monday
    );



  let html = "";



  weekList.forEach(week=>{


    const sunday =
      new Date(week.monday);


    sunday.setDate(
      week.monday.getDate()+6
    );


    html += `

<div class="card">


<div
style="
display:flex;
justify-content:space-between;
align-items:center;
gap:12px;
"
>


<!-- 左側：週情報 -->

<div
style="
flex:1;
"
>

<div style="
font-size:13px;
font-weight:700;
color:#6b7280;
margin-bottom:8px;
">

${String(week.monday.getFullYear()).slice(2)}/${week.monday.getMonth()+1}/${week.monday.getDate()}
〜
${String(sunday.getFullYear()).slice(2)}/${sunday.getMonth()+1}/${sunday.getDate()}

</div>


<div style="
font-size:16px;
color:#374151;
">

売上：
<span style="
font-size:18px;
font-weight:700;
color:#2563eb;
">
${week.sales.toLocaleString()}
</span>
円

<br>

件数：
<span style="
font-weight:700;
color:#111827;
">
${week.count}
</span>
件

</div>

</div>



<!-- 右側：仮グラフ -->

<div
style="
display:flex;
justify-content:space-between;
align-items:flex-end;
height:100px;
width:150px;
gap:3px;
"
>


${createWeekChart(week.days)}


</div>


</div>


</div>

`;



    });

  area.innerHTML = html;


}

function toggleWeekdayWeekendAnalysis(){

  const area =
    document.getElementById("weekdayWeekendAnalysis");

  const btn =
    document.querySelector(".analysis-detail-toggle");

  if(area.style.display === "none"){

    area.style.display = "block";
    btn.innerText = "▲ 平日・土日詳細分析";

  }else{

    area.style.display = "none";
    btn.innerText = "▼ 平日・土日詳細分析";

  }

}

function handleSwipe(type){

  const diff = touchEndX - touchStartX;

  if(Math.abs(diff) < 50){
    return;
  }

  // 実績ページ
  if(type === "history"){

    if(diff < 0){
      changeMonth(1);
    }else{
      changeMonth(-1);
    }

  }

  // 分析ページ
  if(type === "analysis"){

    if(diff < 0){
      moveAnalysisPeriod(1);
    }else{
      moveAnalysisPeriod(-1);
    }

  }

}

function openWorkTimeModal(){

  const targetDate = getSelectedHistoryDate();

  if(!targetDate){
    alert("日付を選択してください");
    return;
  }

      const history = getHistory();

  const data =
    history.find(h => h.date === targetDate);

  let html = "";

  if(!data){

    html = `
  この日の時間帯データはありません

  <br><br>

  <button
    class="rain-btn"
    style="width:100%;"
    onclick="enterWorkTimeEditMode()"
  >
    入力する
  </button>
`;

  }else{

    const periods = [];

    if(data.start1 || data.end1){
      periods.push(
        `① ${data.start1 || "--:--"} ～ ${data.end1 || "--:--"}`
      );
    }

    if(data.start2 || data.end2){
      periods.push(
        `② ${data.start2 || "--:--"} ～ ${data.end2 || "--:--"}`
      );
    }

    if(data.start3 || data.end3){
      periods.push(
        `③ ${data.start3 || "--:--"} ～ ${data.end3 || "--:--"}`
      );
    }

    if(periods.length === 0){

      html = `
  この日の時間帯データはありません

  <br><br>

  <button
    class="rain-btn"
    style="width:100%;"
    onclick="enterWorkTimeEditMode()"
  >
    入力する
  </button>
`;

    }else{

      html = periods.join("<br>");

    }

  }

  document.getElementById(
  "workTimeModalBody"
).innerHTML = html;

const editBtn =
  document.getElementById("workTimeEditBtn");

if(
  html.includes("入力する")
){

  editBtn.style.display = "none";

}else{

  editBtn.style.display = "block";

}

document.getElementById(
  "workTimeModal"
).style.display = "flex";

}

function closeWorkTimeModal(){

  document.getElementById(
    "workTimeModal"
  ).style.display = "none";

  document.getElementById(
    "workTimeModalBody"
  ).innerHTML = "";

  document.getElementById(
    "workTimeEditBtn"
  ).style.display = "block";

}

function enterWorkTimeEditMode(){

  const targetDate = getSelectedHistoryDate();

  if(!targetDate){
    return;
  }

      const history = getHistory();

  const data =
    history.find(h => h.date === targetDate) || {};

  document.getElementById(
    "workTimeModalBody"
  ).innerHTML = `

    <div style="
  display:flex;
  justify-content:center;
  align-items:center;
  gap:4px;
  margin-bottom:8px;
  font-size:13px;
">
  <span style="width:16px;">①</span>

  <input
    type="time"
    id="modalStart1"
    value="${data.start1 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >

  <span>～</span>

  <input
    type="time"
    id="modalEnd1"
    value="${data.end1 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >
</div>

   <div style="
  display:flex;
  justify-content:center;
  align-items:center;
  gap:4px;
  margin-bottom:8px;
  font-size:13px;
">
  <span style="width:16px;">②</span>

  <input
    type="time"
    id="modalStart2"
    value="${data.start2 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >

  <span>～</span>

  <input
    type="time"
    id="modalEnd2"
    value="${data.end2 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >
</div>

    <div style="
  display:flex;
  justify-content:center;
  align-items:center;
  gap:4px;
  margin-bottom:8px;
  font-size:13px;
">
  <span style="width:16px;">③</span>

  <input
    type="time"
    id="modalStart3"
    value="${data.start3 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >

  <span>～</span>

  <input
    type="time"
    id="modalEnd3"
    value="${data.end3 || ""}"
    style="
      width:90px;
      font-size:12px;
      padding:4px;
    "
  >
</div>

    <button
      class="end-btn"
      style="width:100%; margin-top:14px;"
      onclick="saveWorkTimeModal()"
    >
      保存
    </button>

  `;

  document.getElementById(
    "workTimeEditBtn"
  ).style.display = "none";

}

function openUberDetailModal(){

  document.getElementById(
    "uberDetailModal"
  ).style.display = "flex";
  calculateUberDetail();

}

function closeUberDetailModal(){

  document.getElementById(
    "uberDetailModal"
  ).style.display = "none";

}

function calculateUberDetail(){

  const base =
    Number(
      document.getElementById("historyUberBase").value || 0
    );

  const promotion =
    Number(
      document.getElementById("historyUberPromotion").value || 0
    );

  const tip =
    Number(
      document.getElementById("historyUberTip").value || 0
    );

  const other =
    Number(
      document.getElementById("historyUberOther").value || 0
    );

  const total =
    base +
    promotion +
    tip +
    other;

  document.getElementById("historyUberSales").value =
    total;

  calculateHistoryDetail();

}

function saveUberDetail(){

  saveHistoryDetail();

  closeUberDetailModal();

}

function saveWorkTimeModal(){

  const targetDate = getSelectedHistoryDate();

  if(!targetDate){
    return;
  }

  let history = getHistory();

  const index =
    history.findIndex(h => h.date === targetDate);

  if(index < 0){
    return;
  }

  history[index].start1 =
    document.getElementById("modalStart1").value;

  history[index].end1 =
    document.getElementById("modalEnd1").value;

  history[index].start2 =
    document.getElementById("modalStart2").value;

  history[index].end2 =
    document.getElementById("modalEnd2").value;

  history[index].start3 =
    document.getElementById("modalStart3").value;

  history[index].end3 =
    document.getElementById("modalEnd3").value;

  saveHistory(history);

  alert("稼働時間を保存しました");

showHistoryDetail(targetDate);

closeWorkTimeModal();
  
}

function moveHistoryDate(diff){

  const targetDate =
    getSelectedHistoryDate();

  if(!targetDate){
    return;
  }

  const date =
    new Date(targetDate);

  date.setDate(
    date.getDate() + diff
  );

  const newDateKey =
    `${date.getFullYear()}-${
      String(date.getMonth()+1)
      .padStart(2,"0")
    }-${
      String(date.getDate())
      .padStart(2,"0")
    }`;

  selectedHistoryDate = newDateKey;

  currentDate = new Date(newDateKey);

showHistoryDetail(newDateKey);

renderCalendar();

}

function calculateUberDetail(){

  const base =
    Number(
      document.getElementById("historyUberBase").value || 0
    );

  const promotion =
    Number(
      document.getElementById("historyUberPromotion").value || 0
    );

  const tip =
    Number(
      document.getElementById("historyUberTip").value || 0
    );

  const other =
    Number(
      document.getElementById("historyUberOther").value || 0
    );

  const total =
    base +
    promotion +
    tip +
    other;

  document.getElementById("uberDetailTotal")
    .innerText =
      total.toLocaleString() + "円";

  const uberSales =
    Number(
      document.getElementById("historyUberSales").value || 0
    );

  const diff =
    total - uberSales;

  const diffEl =
    document.getElementById("uberDetailDiff");

  if(diff === 0){

    diffEl.innerText =
      "✓ Uber売上と一致";

  }else{

    diffEl.innerText =
      `差額 ${diff.toLocaleString()}円`;

  }

}

function exportBackup(){

  const backup = {
    version: 1,
    backupDate: new Date().toISOString(),
    localStorage: {}
  };

  for(let i = 0; i < localStorage.length; i++){

    const key = localStorage.key(i);

    backup.localStorage[key] =
      localStorage.getItem(key);

  }

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type:"application/json" }
  );

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  const today =
    new Date().toISOString().slice(0,10);

  a.href = url;
  a.download = `delivery-backup-${today}.json`;

  a.click();

  URL.revokeObjectURL(url);

  updateLastBackupDate();

}

function updateLastBackupDate(){

  const now = new Date();

  const text =
    `${now.getFullYear()}/${
      String(now.getMonth()+1).padStart(2,"0")
    }/${
      String(now.getDate()).padStart(2,"0")
    } ${
      String(now.getHours()).padStart(2,"0")
    }:${
      String(now.getMinutes()).padStart(2,"0")
    }`;

  localStorage.setItem(
    "lastBackupDate",
    text
  );

  document.getElementById("lastBackupDate").innerText =
    text;

}

function selectBackupFile(){

  document.getElementById("importFile").click();

}

function importBackup(event){

  const file = event.target.files[0];

  if(!file){
    return;
  }

  if(!confirm("現在のデータをバックアップデータで上書きしますか？")){
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e){

    try{

      const backup =
        JSON.parse(e.target.result);

      if(!backup.localStorage){
        alert("バックアップファイルではありません");
        return;
      }

      localStorage.clear();

      for(const key in backup.localStorage){

        localStorage.setItem(
          key,
          backup.localStorage[key]
        );

      }

      alert("復元が完了しました。画面を再読み込みします。");

      location.reload();

    }catch(err){

      alert("読み込みに失敗しました");

    }

  };

  reader.readAsText(file);

  event.target.value = "";

}

function getMonthKey(){

  return `${currentDate.getFullYear()}-${
    String(currentDate.getMonth()+1).padStart(2,"0")
  }`;

}

function getMonthlyGoal(){

  const goals =
    JSON.parse(
      localStorage.getItem("monthlyGoals") || "{}"
    );

  return Number(
    goals[getMonthKey()] || 0
  );

}

function getWorkedBusinessDays(){

  const history = getHistory();

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  let count = 0;

  history.forEach(h=>{

    if(!h.date) return;

    const d = new Date(h.date);

    if(
      d.getFullYear() === year &&
      d.getMonth() === month &&
      !h.isOffDay
    ){
      count++;
    }

  });

  return count;

}

function getRemainingBusinessDays(){

  const now = new Date();
  const history = getHistory();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();


  // 実績ページで表示している年月
  const targetYear =
    currentDate.getFullYear();

  const targetMonth =
    currentDate.getMonth();


  // 過去月
  if(
    targetYear < currentYear ||
    (
      targetYear === currentYear &&
      targetMonth < currentMonth
    )
  ){

    return 0;

  }


  let startDay = 1;


  // 今月の場合のみ今日判定
  if(
    targetYear === currentYear &&
    targetMonth === currentMonth
  ){

    startDay =
      now.getDate();


    const todayKey =
      `${currentYear}-${
        String(currentMonth+1).padStart(2,"0")
      }-${
        String(startDay).padStart(2,"0")
      }`;
    
    const todayData =
      history.find(
        h => h.date === todayKey
      );


    // 今日実績済みなら翌日から
    if(todayData){

      startDay++;

    }

  }


  const lastDay =
    new Date(
      targetYear,
      targetMonth + 1,
      0
    ).getDate();


  let count = 0;

for(
  let day = startDay;
  day <= lastDay;
  day++
){

  const dateKey =
    `${targetYear}-${
      String(targetMonth + 1).padStart(2,"0")
    }-${
      String(day).padStart(2,"0")
    }`;

  const data =
    history.find(h => h.date === dateKey);

  if(data?.isOffDay){
    continue;
  }

  count++;

}

return count;

}

function updateMonthlyGoalDetail(){

  const goal =
    getMonthlyGoal();

    const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();


  const targetYear =
    currentDate.getFullYear();

  const targetMonth =
    currentDate.getMonth();


  const isPastMonth =
    targetYear < currentYear ||
    (
      targetYear === currentYear &&
      targetMonth < currentMonth
    );


  const sales =
    Number(
      document.getElementById("monthTotal")
      .innerText
      .replace(/[¥,]/g,"")
    ) || 0;


  const remaining =
    Math.max(
      goal - sales,
      0
    );


  const remainingDays =
    getRemainingBusinessDays();


  let requiredPerDay = 0;


  if(
    remainingDays > 0
  ){

    requiredPerDay =
      Math.ceil(
        remaining / remainingDays
      );

  }

  updateTodayGoal(requiredPerDay);


  // 平均単価
  const history = getHistory();


  const monthKey =
    getMonthKey();


  let monthCount = 0;
  let monthSales = 0;


  history.forEach(item=>{

    if(
      item.date &&
      item.date.startsWith(monthKey)
    ){

      monthSales +=
        Number(item.totalSales || 0);

      monthCount +=
        Number(item.totalCount || 0);

    }

  });


  const averagePrice =
    monthCount > 0
    ? Math.round(
        monthSales / monthCount
      )
    : 0;


  let requiredCount = 0;


  if(
    averagePrice > 0
  ){

    requiredCount =
      Math.ceil(
        remaining / averagePrice
      );

  }


  document.getElementById(
    "remainingBusinessDays"
  ).innerText =
    remainingDays + "日";


  document.getElementById(
  "requiredPerDay"
).innerText =
  isPastMonth
  ? "-"
  : "¥" + requiredPerDay.toLocaleString();


  document.getElementById(
  "requiredCount"
).innerText =
  isPastMonth
  ? "-"
  : requiredCount + "件";

  const requiredCountPerDay =
  remainingDays > 0
  ? Math.ceil(
      requiredCount / remainingDays
    )
  : 0;


document.getElementById(
  "requiredCountPerDay"
).innerText =
  isPastMonth
  ? "-"
  : requiredCountPerDay + "件";

}

function updateTodayGoal(requiredPerDay){

  const todayKey =
    getBusinessDateKey();

  const autoGoalKey =
    "autoGoal_" + todayKey;

  if(
    localStorage.getItem(autoGoalKey)
  ){
    return;
  }

  const goalInput =
    document.getElementById("dailyGoal");

  if(!goalInput){
    return;
  }

  goalInput.value =
    requiredPerDay;

  formatGoalInput();

  calculateResults();

  localStorage.setItem(
    autoGoalKey,
    "done"
  );

}

function saveMonthlyGoal(value){

  const goals =
    JSON.parse(
      localStorage.getItem("monthlyGoals") || "{}"
    );

  goals[getMonthKey()] = Number(value) || 0;

  localStorage.setItem(
    "monthlyGoals",
    JSON.stringify(goals)
  );

  // 今日の自動目標を再計算できるようにする
  localStorage.removeItem(
    "autoGoal_" + getBusinessDateKey()
  );

}

let goalManageYear =
  new Date().getFullYear();

function openGoalManageModal(){

  goalManageYear =
    currentDate.getFullYear();

  renderGoalManageModal();

  document.getElementById(
    "goalManageModal"
  ).style.display = "flex";

}

function closeGoalManageModal(){

  document.getElementById(
    "goalManageModal"
  ).style.display = "none";

}

function changeGoalYear(diff){

  goalManageYear += diff;

  renderGoalManageModal();

}

function renderGoalManageModal(){

  document.getElementById(
    "goalManageYear"
  ).innerText =
    goalManageYear + "年";

  const goals =
    JSON.parse(
      localStorage.getItem("monthlyGoals") || "{}"
    );

  let html = "";

  let total = 0;

  for(let month=1; month<=12; month++){

    const isCurrentMonth =
  goalManageYear === new Date().getFullYear()
  &&
  month === new Date().getMonth()+1;

    const key =
      `${goalManageYear}-${String(month).padStart(2,"0")}`;

    const value =
      Number(goals[key] || 0);

    total += value;

    html += `

<div style="
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:10px;
gap:10px;
padding:8px;
border-radius:10px;
background:${
  isCurrentMonth
  ? "#eff6ff"
  : "transparent"
};
">

<div style="font-weight:700;width:40px;">
${month}月
</div>

<input
type="text"
inputmode="numeric"
id="goal-${key}"
value="${value ? value.toLocaleString() : ""}"
oninput="formatGoalManageInput(this)"
onblur="saveGoalManageInput('${key}', this.value)"
style="
text-align:center;
flex:1;
"
/>

</div>

`;

  }

  html += `

<hr>

<div style="
display:flex;
justify-content:center;
align-items:center;
gap:12px;
font-weight:700;
font-size:18px;
margin-top:14px;
">

<div>
年間目標
</div>

<div
id="goalYearTotal"
style="color:#2563eb;"
>
¥${total.toLocaleString()}
</div>

</div>

`;

  document.getElementById(
    "goalManageBody"
  ).innerHTML = html;

}

function formatGoalManageInput(input){

  let value =
    input.value.replace(/,/g,"");

  if(value === ""){
    input.value = "";
  }else{

    value =
      Number(value).toLocaleString();

    input.value = value;

  }

  updateGoalYearTotal();

}

function updateGoalYearTotal(){

  let total = 0;

  for(let month=1; month<=12; month++){

    const key =
      `${goalManageYear}-${String(month).padStart(2,"0")}`;

    const input =
      document.getElementById(
        `goal-${key}`
      );

    if(input){

      total +=
        Number(
          input.value.replace(/,/g,"")
        ) || 0;

    }

  }

  const totalEl =
    document.getElementById(
      "goalYearTotal"
    );

  if(totalEl){

    totalEl.innerText =
      "¥" + total.toLocaleString();

  }

}

function saveGoalManageInput(key, value){

  const goals =
    JSON.parse(
      localStorage.getItem("monthlyGoals") || "{}"
    );

  const number =
    Number(
      String(value).replace(/,/g,"")
    ) || 0;


  goals[key] = number;


  localStorage.setItem(
    "monthlyGoals",
    JSON.stringify(goals)
  );


  // 現在表示中の月なら更新
  if(
  key === getMonthKey()
){

  // 今日の自動目標を再計算できるようにする
  localStorage.removeItem(
    "autoGoal_" + getBusinessDateKey()
  );

  renderMonthlyGoal();

  updateMonthlyGoalProgress();

  updateMonthlyGoalDetail();

}

}

function applyAnalysisRange(){

  const start =
    document.getElementById(
      "analysisRangeStart"
    ).value;


  const end =
    document.getElementById(
      "analysisRangeEnd"
    ).value;


  if(!start || !end){

    alert("開始日と終了日を入力してください");

    return;

  }


  if(start > end){

    alert("開始日は終了日より前の日付にしてください");

    return;

  }


  analysisRangeStart = start;
  analysisRangeEnd = end;


  renderAnalysis();

}

function getCurrentMonthSummary(){

  const history = getHistory();

  const monthKey = getMonthKey();

  const goals =
    JSON.parse(
      localStorage.getItem("monthlyGoals") || "{}"
    );

  const goal =
    Number(goals[monthKey] || 0);

  let totalSales = 0;

let totalCount = 0;

let totalHours = 0;  
  
  history.forEach(h=>{

    if(
  h.date &&
  h.date.startsWith(monthKey) &&
  !h.isOffDay
){
      totalSales +=
        Number(h.totalSales || 0);

      totalCount +=
  Number(h.totalCount || 0);

      const match =
  (h.workTime || "")
  .match(/(\d+)時間\s*(\d+)分/);

if(match){

  const hour =
    Number(match[1]);

  const minute =
    Number(match[2]);

  totalHours +=
    hour + (minute / 60);

}

    }

  });

  const percent =
    goal > 0
    ? Math.min(
        Math.round(totalSales / goal * 100),
        100
      )
    : 0;

  // 残り売上
const remainingSales =
  Math.max(
    goal - totalSales,
    0
  );


// 残り稼働日数
const remainingDays =
  getRemainingBusinessDays();

  // 営業済み日数
const workedDays =
  getWorkedBusinessDays();


// 平均売上/日
const avgSales =
  workedDays > 0
  ? Math.round(totalSales / workedDays)
  : 0;


// 月末予測売上
const forecastSales =
  avgSales *
  (workedDays + remainingDays);


// 1日あたり必要売上
const needSalesPerDay =
  remainingDays > 0
  ? Math.ceil(
      remainingSales / remainingDays
    )
  : remainingSales;

  // 平均1件単価

const unitPrice =
  totalCount > 0
  ? Math.round(
      totalSales / totalCount
    )
  : 0;


// 目標達成に必要な件数

const remainingCount =
  unitPrice > 0
  ? Math.ceil(
      remainingSales / unitPrice
    )
  : 0;


// 1日あたり必要件数

const needCountPerDay =
  remainingDays > 0
  ? Math.ceil(
      remainingCount / remainingDays
    )
  : remainingCount;

  // 平均配達件数/時間

const avgCountPerHour =
  totalHours > 0
  ? Number(
      (totalCount / totalHours)
      .toFixed(2)
    )
  : 0;

  // 1時間あたり売上

const salesPerHour =
  unitPrice * avgCountPerHour;


// 1日必要稼働時間

const needWorkHoursPerDay =
  salesPerHour > 0
  ? Number(
      (needSalesPerDay / salesPerHour)
      .toFixed(1)
    )
  : 0;

  return{

  goal,

  totalSales,

  totalCount,

  percent,

  remainingSales,

  remainingDays,

  needSalesPerDay,

  unitPrice,

  remainingCount,

  needCountPerDay,

totalHours,

avgCountPerHour,

needWorkHoursPerDay,

forecastSales

};

}

function toggleRecordBar(){

  const card =
    document.getElementById(
      "workStatusCard"
    );

  if(!card) return;


  const isMini =
    card.classList.contains("mini");


  if(isMini){

    card.classList.remove("mini");

  }else{

    card.classList.add("mini");

  }


  localStorage.setItem(
    "workStatusCardMini",
    card.classList.contains("mini")
  );

}

// ==========================
// 稼働カード状態保存（iPhone対応）
// ==========================

document.addEventListener("visibilitychange", () => {

  const card =
    document.getElementById("workStatusCard");

  if(!card) return;

  localStorage.setItem(
    "workStatusCardMini",
    card.classList.contains("mini")
  );

});
