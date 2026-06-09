let currentDate = new Date();

let touchStartX = 0;
let touchEndX = 0;

const BUSINESS_RESET_HOUR = 4;

function switchPage(page){

  document.querySelectorAll(".page")
  .forEach(p=>p.classList.remove("active"));

  document.querySelectorAll(".nav-btn")
  .forEach(b=>b.classList.remove("active"));

  if(page==="today"){
    document.getElementById("todayPage").classList.add("active");
    document.querySelectorAll(".nav-btn")[0].classList.add("active");
  }

  if(page==="history"){
    document.getElementById("historyPage").classList.add("active");
    document.querySelectorAll(".nav-btn")[1].classList.add("active");
    renderCalendar();
  }

  if(page==="analysis"){
    document.getElementById("analysisPage").classList.add("active");
    document.querySelectorAll(".nav-btn")[2].classList.add("active");
  }

  if(page==="settings"){
    document.getElementById("settingsPage").classList.add("active");
    document.querySelectorAll(".nav-btn")[3].classList.add("active");
  }

}

let isRainy = false;

function toggleRain(){

  isRainy = !isRainy;

  const btn =
    document.getElementById("rainToggleBtn");

  if(isRainy){

  btn.classList.add("active");
  btn.innerText = "☔ 雨ｸｴON";

}else{

  btn.classList.remove("active");
  btn.innerText = "☔ 雨ｸｴOFF";

}

  saveCurrentData();

}

/* ↓↓↓ ここに追加 ↓↓↓ */

let historyRainy = false;

function toggleHistoryRain(){

  historyRainy = !historyRainy;

  const btn =
    document.getElementById("historyRainBtn");

  if(historyRainy){

    btn.classList.add("active");
    btn.innerText = "☔ 雨ｸｴON";

  }else{

    btn.classList.remove("active");
    btn.innerText = "☔ 雨ｸｴOFF";

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

  let history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

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

   memo:
  document.getElementById("memo").value,

isRainy:isRainy,
  };

  const index =
    history.findIndex(h=>h.date===dateKey);

  if(index >= 0){

    history[index] = data;

  }else{

    history.push(data);

  }

  localStorage.setItem(
    "deliveryHistory",
    JSON.stringify(history)
  );

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

isRainy = data.isRainy || false;

const btn =
  document.getElementById("rainToggleBtn");

if(isRainy){

  btn.classList.add("active");
  btn.innerText = "☔ 雨ｸｴON";

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

}


function changeMonth(value){

  currentDate.setMonth(
    currentDate.getMonth() + value
  );

  renderCalendar();

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

  const history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

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

    const historyData =
      history.find(h=>h.date===dateKey);

    const day =
      document.createElement("div");

    day.className = "calendar-day";

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
</div>

<div class="day-sales">
${
  historyData
  ? Number(historyData.totalSales).toLocaleString()
  : ""
}
</div>
`;

    day.onclick = ()=>{

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

  const history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

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
      memo:""
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

  document.getElementById("historyTotalSales").value =
    data.totalSales || "";

  document.getElementById("historyTotalCount").value =
    data.totalCount || "";

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

  document.getElementById("historyHourly").value =
    data.hourly || "";

document.getElementById("historyDeliveryPerHour").value =
  data.deliveryPerHour || "";

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

  document.getElementById("historyMemo").value =
  data.memo || "";

// 追加
calculateHistoryDetail();

historyRainy = data.isRainy || false;

const rainBtn =
  document.getElementById("historyRainBtn");

if(historyRainy){

  rainBtn.classList.add("active");
  rainBtn.innerText = "☔ 雨ｸｴON";

}else{

  rainBtn.classList.remove("active");
  rainBtn.innerText = "☔ 雨ｸｴOFF";

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

  document.getElementById("historyTotalCount").value =
    totalCount;

  document.getElementById("historyTotalSales").value =
    totalSales;

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

  document.getElementById("historyHourly").value =
  hourly;

let deliveryPerHour = 0;

if(totalHours > 0){
  deliveryPerHour =
    (totalCount / totalHours).toFixed(2);
}

document.getElementById("historyDeliveryPerHour").value =
  deliveryPerHour;

let unitPrice = 0;

if(totalCount > 0){

  unitPrice =
    Math.round(totalSales / totalCount);

}

document.getElementById("historyUnitPrice").value =
  unitPrice;

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

  let history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

  const newData = {

    date: targetDate,

    totalSales:
      document.getElementById("historyTotalSales").value,

    totalCount:
      document.getElementById("historyTotalCount").value,

    workTime:
      `${document.getElementById("historyWorkHour").value || 0}時間 ${
        document.getElementById("historyWorkMinute").value || 0
      }分`,

    hourly:
      document.getElementById("historyHourly").value,
deliveryPerHour:
  document.getElementById("historyDeliveryPerHour").value,

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

   memo:
  document.getElementById("historyMemo").value,

isRainy:historyRainy,

  };

  const index =
    history.findIndex(h => h.date === targetDate);

  if(index >= 0){

    history[index] = newData;

  }else{

    history.push(newData);

  }

  localStorage.setItem(
    "deliveryHistory",
    JSON.stringify(history)
  );

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

  let history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

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
let analysisDate = new Date();

document.getElementById("businessDate").value =
  getBusinessDateKey();

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

  const history =
    JSON.parse(
      localStorage.getItem("deliveryHistory") || "[]"
    );

  const now = analysisDate;

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

  }

if(analysisType === "all"){

  filtered = history;

  document.getElementById(
    "analysisPeriodLabel"
  ).innerText = "全期間";

  document.getElementById(
    "analysisServicePeriod"
  ).innerText = "全期間";

}

  const workDays = filtered.length;

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
   document.getElementById("analysisAllUnit").innerText =
  totalCount > 0
  ? Math.round(totalSales / totalCount).toLocaleString()
  : 0;

// ↓ここから追加

const prevBtn =
  document.getElementById("analysisPrevBtn");

const nextBtn =
  document.getElementById("analysisNextBtn");

if(analysisType === "all"){

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

  handleSwipe("analysis");

});

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
