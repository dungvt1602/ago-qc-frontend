const API_ENDPOINT = 'https://ago-qc-backend.onrender.com/api';

// Cấu hình nén ảnh trước khi gửi lên Google Drive.
// Mục tiêu: ảnh đủ rõ để làm hồ sơ QC, nhưng PDF không quá nặng.
const PHOTO_MAX_SIDE = 1280;
const PHOTO_JPEG_QUALITY = 0.70;

const DAILY_ITEMS = [
  { code: 'BEFORE_SORTING', vi: 'Đánh giá nguyên liệu trước phân loại', en: 'Before sorting' },
  { code: 'AFTER_SORTING', vi: 'Đánh giá nguyên liệu sau phân loại', en: 'After sorting' },
  { code: 'PACKAGING_CHECK', vi: 'Kiểm tra bao bì, đóng gói', en: 'Packaging check' },
  { code: 'PALLET_CHECK', vi: 'Kiểm tra xếp pallet', en: 'Pallet check' },
  { code: 'STORAGE_CHECK', vi: 'Kiểm tra bảo quản', en: 'Storage check' },
  { code: 'FINISHED_QTY_CHECK', vi: 'Kiểm tra số lượng thành phẩm', en: 'Finished qty check' }
];

const CONTAINER_ITEMS = [
  [1,'Ảnh nguyên thùng, đai/kiện của 8-10 thùng ngẫu nhiên','Photo of 8-10 random cartons/bundles'],
  [2,'Ảnh mở nắp của 3-5 thùng ngẫu nhiên','Open-top photo of 3-5 random cartons'],
  [3,'Ảnh mở nắp của 3-5 thùng ngẫu nhiên','Open-top photo of 3-5 random cartons'],
  [4,'Ảnh sau khi xếp tất cả hàng trong thùng ra ngoài','Photo after laying all carton contents out'],
  [5,'Ảnh sau khi xếp tất cả hàng trong thùng ra ngoài','Photo after laying all carton contents out'],
  [6,'Ảnh sau khi xếp tất cả hàng trong thùng ra ngoài','Photo after laying all carton contents out'],
  [7,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [8,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [9,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [10,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [11,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [12,'Chụp cận 3-5 trái để đánh giá','Close-up of 3-5 fruits for assessment'],
  [13,'Đo nhiệt độ trong trái','Core temperature'],
  [14,'Tem nhãn / mã lô','Label / lot code'],
  [15,'Xếp container','Container loading'],
  [16,'Thuốc bảo quản','Preservative'],
  [17,'Ảnh logger','Logger photo'],
  [18,'Đóng cửa','Door closing'],
  [19,'Bấm seal','Sealing'],
  [20,'Số seal','Seal number'],
  [21,'Nhiệt độ rời kho','Departure temperature']
];

let state = { files: [], current: null, message: '', error: '', section: 'menu', activeDailyId: null, activeDailyItemCode: null, activeContainerNo: null };
let cameraStream = null;
let cameraTarget = null;
let capturedDataUrl = '';

const $ = (id) => document.getElementById(id);
const app = $('app');

$('refreshBtn').addEventListener('click', () => loadFiles());

async function api(action, payload = {}) {
  showLoader('Đang xử lý...');
  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload })
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`API trả về dữ liệu không phải JSON. HTTP ${res.status}. ${text.slice(0, 500)}`);
    }
    if (!res.ok) {
      throw new Error(data.error || data.errorMessage || `API HTTP error ${res.status}`);
    }
    if (!data.ok) throw new Error(data.error || data.errorMessage || JSON.stringify(data).slice(0, 500) || 'API error');
    return data.result;
  } finally {
    hideLoader();
  }
}

function showLoader(text) {
  let el = document.querySelector('.loader');
  if (!el) {
    el = document.createElement('div');
    el.className = 'loader';
    document.body.appendChild(el);
  }
  el.textContent = text;
}
function hideLoader(){ const el = document.querySelector('.loader'); if (el) el.remove(); }
function setMsg(msg){ state.message = msg; state.error = ''; }
function setErr(err){ state.error = String(err.message || err); state.message = ''; }
function flash(){
  return `${state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : ''}${state.message ? `<div class="success">${escapeHtml(state.message)}</div>` : ''}`;
}

async function init(){
  await loadFiles();
}

async function loadFiles(){
  try {
    state.files = await api('listQCFiles');
    state.current = null;
    renderList();
  } catch (e) { setErr(e); renderList(); }
}

function renderList(){
  app.innerHTML = `${flash()}
    <div class="card">
      <div class="between">
        <div>
          <h2>Hồ sơ QC</h2>
          <div class="muted">Tạo hồ sơ, nhập thông tin, chụp ảnh trực tiếp và xuất PDF theo mẫu song ngữ.</div>
        </div>
        <button class="primary" onclick="renderCreate()">+ Tạo hồ sơ mới</button>
      </div>
    </div>
    <div class="stack">
      ${state.files.length ? state.files.map(fileCard).join('') : `<div class="card muted">Chưa có hồ sơ QC nào.</div>`}
    </div>`;
}

function fileCard(f){
  return `<div class="file-item" onclick="openFile('${f.ID}')">
    <div class="between">
      <b>${escapeHtml(f.LOT_CODE || f.QC_FILE_NO || '')}</b>
      <span class="pill">${escapeHtml(f.STATUS || 'DRAFT')}</span>
    </div>
    <div>${escapeHtml(f.PRODUCT_NAME || 'Chưa nhập sản phẩm')}</div>
    <div class="muted">PO: ${escapeHtml(f.PO_NO || '-')} | NCC: ${escapeHtml(f.SUPPLIER || '-')} | Ngày tạo: ${escapeHtml(f.CREATED_AT || '')}</div>
    ${f.PDF_URL ? `<a href="${f.PDF_URL}" target="_blank" onclick="event.stopPropagation()">Mở PDF</a>` : ''}
  </div>`;
}

function renderCreate(){
  app.innerHTML = `${flash()}
    <div class="card">
      <div class="between"><h2>Tạo hồ sơ QC mới</h2><button class="ghost" onclick="renderList()">Quay lại</button></div>
      <div class="note">Mã hồ sơ QC và mã lô sẽ tự tạo theo PO và ngày tạo. Ví dụ: QC-PO123-20260619.</div>
      <form id="createForm" class="stack" onsubmit="createQCFile(event)">
        ${infoFieldsHtml({})}
        <button class="primary full" type="submit">Tạo hồ sơ</button>
      </form>
    </div>`;
}

function infoFieldsHtml(f = {}){
  return `<div class="grid2">
    ${input('contractNo','Hợp đồng số / Contract no.', f.CONTRACT_NO)}
    ${input('poNo','PO số / PO no.', f.PO_NO, true)}
    ${input('productionOrder','Lệnh sản xuất / Production order', f.PRODUCTION_ORDER)}
    ${input('standardAppendix','Phụ lục tiêu chuẩn / Standard appendix', f.STANDARD_APPENDIX)}
    ${input('productName','Tên sản phẩm / Product name', f.PRODUCT_NAME, true)}
    ${input('specification','Quy cách/Size/Grade / Specification', f.SPECIFICATION)}
    ${input('supplier','Nhà cung cấp / Supplier', f.SUPPLIER)}
    ${input('supplierCode','Mã NCC / Supplier code', f.SUPPLIER_CODE)}
    ${input('poQuantity','Số lượng theo PO / PO quantity', f.PO_QUANTITY)}
    ${input('unit','Đơn vị tính / Unit', f.UNIT)}
    ${input('estFinishDate','Dự kiến kết thúc / Est. finish date', f.EST_FINISH_DATE, false, 'date')}
    ${input('qcStaff','Nhân viên QC / QC staff', f.QC_STAFF, true)}
    ${input('containerNo','Số container / Container no.', f.CONTAINER_NO)}
    ${input('sealNo','Số seal / Seal no.', f.SEAL_NO)}
    ${input('containerLoadingDate','Ngày đóng cont / Container loading date', f.CONTAINER_LOADING_DATE, false, 'date')}
  </div>`;
}

function input(name,label,value='',required=false,type='text'){
  return `<div class="field"><label>${label}${required?' *':''}</label><input name="${name}" type="${type}" ${required?'required':''} value="${escapeAttr(value)}"></div>`;
}

function getFormData(form){
  return Object.fromEntries(new FormData(form).entries());
}

async function createQCFile(e){
  e.preventDefault();
  try{
    const p = getFormData(e.target);
    state.current = await api('createQCFile', p);
    setMsg('Đã tạo hồ sơ QC.');
    renderDetail();
  }catch(err){ setErr(err); renderCreate(); }
}

async function openFile(id){
  try{
    state.current = await api('getQCFile', { qcFileId: id });
    state.message = ''; state.error = '';
    renderDetail();
  }catch(err){ setErr(err); renderList(); }
}


function setSection(section){
  state.section = section;
  state.activeDailyId = null;
  state.activeDailyItemCode = null;
  state.activeContainerNo = null;
  renderDetail();
}
function backToMenu(){ setSection('menu'); }
function openDailySessionView(dailyQcId){
  state.section = 'daily';
  state.activeDailyId = dailyQcId;
  state.activeDailyItemCode = null;
  renderDetail();
}
function openDailyItemView(dailyQcId, itemCode){
  state.section = 'daily';
  state.activeDailyId = dailyQcId;
  state.activeDailyItemCode = itemCode;
  renderDetail();
}
function openContainerItemView(photoNo){
  state.section = 'container';
  state.activeContainerNo = Number(photoNo);
  renderDetail();
}

function renderDetail(){
  const d = state.current;
  if(!d){ renderList(); return; }
  const f = d.qcFile;
  app.innerHTML = `${flash()}
    <div class="card">
      <div class="between">
        <div>
          <h2>${escapeHtml(f.LOT_CODE)}</h2>
          <div class="muted">Mã hồ sơ: ${escapeHtml(f.QC_FILE_NO)} | PDF tự tăng trang theo số ngày/kho QC và số ảnh thực tế.</div>
        </div>
        <button class="ghost" onclick="loadFiles()">Danh sách</button>
      </div>
      <div class="row" style="margin-top:10px">
        <span class="pill">${escapeHtml(f.STATUS)}</span>
        <span class="pill">Ngày SX: ${escapeHtml(f.TOTAL_PRODUCTION_DAYS || '0')}</span>
        <span class="pill">Kho/cơ sở: ${escapeHtml(f.TOTAL_WAREHOUSES || '0')}</span>
        ${f.PDF_URL ? `<a class="pill" href="${f.PDF_URL}" target="_blank">Mở PDF</a>` : ''}
      </div>
    </div>
    ${renderStepMenu()}
    ${renderActiveSection(d)}`;
}

function renderStepMenu(){
  const items = [
    ['info','A. Thông tin lô hàng','Lot information'],
    ['summary','B. Thống kê','Summary'],
    ['daily','C. QC hàng ngày','Daily QC'],
    ['container','D. Hình ảnh container','Container photos'],
    ['export','E. Xuất PDF','Export PDF']
  ];
  return `<div class="card">
    <h3>Chọn đầu mục thao tác</h3>
    <div class="step-grid">
      ${items.map(([key,vi,en]) => `<button class="step-card ${state.section===key?'active':''}" onclick="setSection('${key}')"><b>${vi}</b><span>${en}</span></button>`).join('')}
    </div>
    <div class="note">Mỗi đầu mục mở riêng một màn hình để QC thao tác nhanh, tránh kéo cuộn quá dài.</div>
  </div>`;
}

function renderActiveSection(d){
  switch(state.section){
    case 'info': return renderInfoSection(d);
    case 'summary': return renderSummarySection(d);
    case 'daily': return renderDailySection(d);
    case 'container': return renderContainerSection(d);
    case 'export': return renderExportSection(d);
    default: return renderOverviewSection(d);
  }
}

function renderOverviewSection(d){
  const dailyCount = d.dailySessions.length;
  const dailyPhotoCount = d.dailySessions.flatMap(s => s.items || []).filter(x => x.PHOTO_FILE_ID || x.PHOTO_URL).length;
  const containerPhotoCount = d.containerItems.filter(x => x.PHOTO_FILE_ID || x.PHOTO_URL).length;
  return `<div class="card">
    <h3>Tổng quan hồ sơ</h3>
    <div class="overview-grid">
      <div class="overview-box"><b>${dailyCount}</b><span>phiên QC</span></div>
      <div class="overview-box"><b>${dailyPhotoCount}</b><span>ảnh QC hàng ngày</span></div>
      <div class="overview-box"><b>${containerPhotoCount}</b><span>ảnh container</span></div>
      <div class="overview-box"><b>${1 + dailyCount + Math.ceil((d.containerItems.length || 0)/9)}</b><span>trang PDF dự kiến</span></div>
    </div>
    <div class="note">Bấm từng đầu mục phía trên để nhập thông tin, thêm ngày QC, chụp ảnh hoặc xuất PDF.</div>
  </div>`;
}

function renderExportSection(d){
  return `<div class="card">
    <h3>Xuất file PDF</h3>
    <div class="note">Bấm xuất, chờ vài giây để server tạo PDF (lần đầu trong ngày có thể lâu hơn vì server vừa thức dậy). Tạo xong, link PDF hiện ngay bên dưới.</div>
    <div class="actions"><button class="primary" onclick="exportPDF()">📄 Xuất PDF</button>${d.qcFile.PDF_URL ? `<a class="ghost" href="${d.qcFile.PDF_URL}" target="_blank">Mở PDF hiện tại</a>` : ''}</div>
    <div class="note">Sau khi tạo xong, bấm <b>Mở PDF hiện tại</b> để xem hoặc tải về.</div>
  </div>`;
}

function renderInfoSection(d){
  const f = d.qcFile;
  return `<div class="card">
    <div class="between"><h3>A. Thông tin lô hàng / Lot information</h3><button class="ghost small-btn" onclick="saveInfo()">Lưu thông tin</button></div>
    <div class="grid2" style="margin-bottom:10px">
      <div class="field"><label>Mã hồ sơ QC / QC file no.</label><input class="readonly" readonly value="${escapeAttr(f.QC_FILE_NO)}"></div>
      <div class="field"><label>Mã lô / Lot code</label><input class="readonly" readonly value="${escapeAttr(f.LOT_CODE)}"></div>
      <div class="field"><label>Ngày bắt đầu / Start date</label><input class="readonly" readonly value="${escapeAttr(f.START_DATE)}"></div>
      <div class="field"><label>Ngày tạo / Created at</label><input class="readonly" readonly value="${escapeAttr(f.CREATED_AT)}"></div>
    </div>
    <form id="infoForm" class="stack">${infoFieldsHtml(f)}</form>
  </div>`;
}

async function saveInfo(){
  try{
    const p = getFormData($('infoForm'));
    p.qcFileId = state.current.qcFile.ID;
    state.current = await api('updateQCFile', p);
    setMsg('Đã lưu thông tin lô hàng.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

function renderSummarySection(d){
  const s = d.summary || {};
  return `<div class="card">
    <div class="between"><h3>B. Thống kê / Summary</h3><button class="ghost small-btn" onclick="saveSummary()">Lưu thống kê</button></div>
    <form id="summaryForm" class="grid2">
      ${input('producedQty','Số lượng đã sản xuất / Produced qty', s.PRODUCED_QTY)}
      ${input('pendingProductionQty','Số lượng chờ sản xuất / Pending production qty', s.PENDING_PRODUCTION_QTY)}
      ${input('totalPassedFinishedGoods','Tổng thành phẩm đạt / Total passed finished goods', s.TOTAL_PASSED_FINISHED_GOODS)}
      ${input('cumulativePassRate','Tỷ lệ đạt lũy kế / Cumulative pass rate', s.CUMULATIVE_PASS_RATE)}
      ${input('totalFailedPending','Tổng không đạt/chờ xử lý / Total failed/pending', s.TOTAL_FAILED_PENDING)}
      ${input('cumulativeFailRate','Tỷ lệ không đạt lũy kế / Cumulative fail rate', s.CUMULATIVE_FAIL_RATE)}
      ${input('totalDelivered','Tổng đã giao / Total delivered', s.TOTAL_DELIVERED)}
      ${input('totalStockOnHand','Tổng tồn kho / Total stock on hand', s.TOTAL_STOCK_ON_HAND)}
      ${input('differenceToResolve','Chênh lệch cần xử lý / Difference to resolve', s.DIFFERENCE_TO_RESOLVE)}
      <div class="field"><label>Hướng xử lý / Handling action</label><textarea name="handlingAction">${escapeHtml(s.HANDLING_ACTION || '')}</textarea></div>
    </form>
  </div>`;
}

async function saveSummary(){
  try{
    const p = getFormData($('summaryForm'));
    p.qcFileId = state.current.qcFile.ID;
    state.current = await api('updateSummary', p);
    setMsg('Đã lưu thống kê.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

async function addDailyQC(e){
  e.preventDefault();
  try{
    const p = getFormData(e.target);
    p.qcFileId = state.current.qcFile.ID;
    state.current = await api('addDailyQC', p);
    setMsg('Đã thêm ngày/kho QC.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

function renderDailySection(d){
  if (state.activeDailyId) return renderDailySessionDetail(d);
  return `<div class="card">
    <div class="between"><h3>QC hàng ngày / Daily QC</h3><button class="ghost small-btn" onclick="backToMenu()">Về đầu mục</button></div>
    <form class="grid3" onsubmit="addDailyQC(event)">
      ${input('qcDate','Ngày QC / QC date', today(), true, 'date')}
      ${input('warehouse','Kho/Cơ sở / Warehouse/Facility', '', true)}
      ${input('qcStaff','Nhân viên QC / QC staff', d.qcFile.QC_STAFF || '', true)}
      <button class="primary" type="submit">+ Thêm ngày/kho QC</button>
    </form>
    <div class="section-title">Danh sách ngày/kho QC</div>
    <div class="stack">
      ${d.dailySessions.length ? d.dailySessions.map(renderDailySessionCard).join('') : '<div class="note">Chưa có ngày QC.</div>'}
    </div>
  </div>`;
}

function renderDailySessionCard(sess){
  const photos = (sess.items || []).filter(x => x.PHOTO_FILE_ID || x.PHOTO_URL).length;
  const filled = (sess.items || []).filter(x => x.PASS_RATE || x.FAIL_RATE || x.REMARKS).length;
  return `<div class="file-item" onclick="openDailySessionView('${sess.ID}')">
    <div class="between"><b>${escapeHtml(sess.QC_DATE)} - ${escapeHtml(sess.WAREHOUSE)}</b><span class="pill">${photos}/6 ảnh</span></div>
    <div class="muted">QC: ${escapeHtml(sess.QC_STAFF || '')} | Đã nhập: ${filled}/6 hạng mục</div>
  </div>`;
}

function renderDailySessionDetail(d){
  const sess = d.dailySessions.find(x => x.ID === state.activeDailyId);
  if (!sess) { state.activeDailyId = null; return renderDailySection(d); }
  if (state.activeDailyItemCode) return renderDailyItemDetail(sess);
  return `<div class="card">
    <div class="between"><h3>${escapeHtml(sess.QC_DATE)} - ${escapeHtml(sess.WAREHOUSE)}</h3><button class="ghost small-btn" onclick="state.activeDailyId=null;renderDetail()">Quay lại danh sách ngày</button></div>
    <div class="note">Chọn từng hạng mục để mở màn hình nhập riêng.</div>
    <div class="stack">
      ${(sess.items || []).map(it => renderDailyItemCard(sess, it)).join('')}
    </div>
  </div>`;
}

function renderDailyItemCard(sess,it){
  const hasPhoto = Boolean(it.PHOTO_URL || it.PHOTO_FILE_ID);
  const hasData = Boolean(it.PASS_RATE || it.FAIL_RATE || it.REMARKS);
  return `<div class="file-item" onclick="openDailyItemView('${sess.ID}','${it.ITEM_CODE}')">
    <div class="between"><b>${escapeHtml(it.ITEM_NAME_VI)}</b><span class="pill">${hasPhoto ? 'Đã có ảnh' : 'Chưa có ảnh'}</span></div>
    <div class="muted">${escapeHtml(it.ITEM_NAME_EN)} | ${hasData ? 'Đã nhập kết quả' : 'Chưa nhập kết quả'}</div>
  </div>`;
}

function renderDailyItemDetail(sess){
  const it = (sess.items || []).find(x => x.ITEM_CODE === state.activeDailyItemCode);
  if (!it) { state.activeDailyItemCode = null; return renderDailySessionDetail(state.current); }
  const hasPhoto = Boolean(it.PHOTO_URL || it.PHOTO_FILE_ID);
  return `<div class="card">
    <div class="between"><h3>${escapeHtml(it.ITEM_NAME_VI)}</h3><button class="ghost small-btn" onclick="state.activeDailyItemCode=null;renderDetail()">Quay lại hạng mục</button></div>
    <div class="muted">${escapeHtml(it.ITEM_NAME_EN)} | ${escapeHtml(sess.QC_DATE)} - ${escapeHtml(sess.WAREHOUSE)}</div>
    <div class="qc-body single-form">
      ${savedPhotoHtml(it)}
      <button class="primary" onclick="openCameraDaily('${sess.ID}','${it.ITEM_CODE}')">📷 Chụp ảnh mục này</button>
      <div class="grid2">
        <div class="field"><label>Tỷ lệ đạt / Pass rate</label><input id="pass_${sess.ID}_${it.ITEM_CODE}" value="${escapeAttr(it.PASS_RATE)}"></div>
        <div class="field"><label>Tỷ lệ không đạt / Fail rate</label><input id="fail_${sess.ID}_${it.ITEM_CODE}" value="${escapeAttr(it.FAIL_RATE)}"></div>
      </div>
      <div class="field"><label>Nhận xét / Remarks</label><textarea id="remarks_${sess.ID}_${it.ITEM_CODE}">${escapeHtml(it.REMARKS || '')}</textarea></div>
      <button class="ghost" onclick="saveDailyItem('${sess.ID}','${it.ITEM_CODE}')">Lưu hạng mục</button>
    </div>
  </div>`;
}

async function saveDailyItem(dailyQcId,itemCode){
  try{
    const payload = {
      dailyQcId,
      itemCode,
      passRate: $(`pass_${dailyQcId}_${itemCode}`).value,
      failRate: $(`fail_${dailyQcId}_${itemCode}`).value,
      remarks: $(`remarks_${dailyQcId}_${itemCode}`).value
    };
    state.current = await api('saveDailyQCItem', payload);
    setMsg('Đã lưu hạng mục QC.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

function renderContainerSection(d){
  if (state.activeContainerNo) return renderContainerItemDetail(d);
  return `<div class="card">
    <div class="between"><h3>Hình ảnh giao hàng - Container</h3><button class="ghost small-btn" onclick="backToMenu()">Về đầu mục</button></div>
    <div class="note">Chọn từng đầu mục ảnh để mở màn hình chụp/nhập riêng. Mỗi 9 ảnh sẽ tự chia thành một trang trong PDF.</div>
    <div class="stack">
      ${d.containerItems.map(renderContainerItemCard).join('')}
    </div>
  </div>`;
}

function renderContainerItemCard(it){
  const no = Number(it.PHOTO_NO);
  const hasPhoto = Boolean(it.PHOTO_URL || it.PHOTO_FILE_ID);
  const hasData = Boolean(it.PASS_RATE || it.FAIL_RATE || it.REMARKS);
  return `<div class="file-item" onclick="openContainerItemView(${no})">
    <div class="between"><b>${escapeHtml(it.ITEM_NAME_VI)}</b><span class="pill">${hasPhoto ? 'Đã có ảnh' : 'Chưa có ảnh'}</span></div>
    <div class="muted">${escapeHtml(it.DESCRIPTION_VI)} / ${escapeHtml(it.DESCRIPTION_EN)} | ${hasData ? 'Đã nhập kết quả' : 'Chưa nhập kết quả'}</div>
  </div>`;
}

function renderContainerItemDetail(d){
  const it = d.containerItems.find(x => Number(x.PHOTO_NO) === Number(state.activeContainerNo));
  if (!it) { state.activeContainerNo = null; return renderContainerSection(d); }
  const no = Number(it.PHOTO_NO);
  const hasPhoto = Boolean(it.PHOTO_URL || it.PHOTO_FILE_ID);
  return `<div class="card">
    <div class="between"><h3>${escapeHtml(it.ITEM_NAME_VI)}</h3><button class="ghost small-btn" onclick="state.activeContainerNo=null;renderDetail()">Quay lại ảnh container</button></div>
    <div class="muted">${escapeHtml(it.ITEM_NAME_EN)}</div>
    <div class="qc-body single-form">
      <div>${escapeHtml(it.DESCRIPTION_VI)} / ${escapeHtml(it.DESCRIPTION_EN)}</div>
      ${savedPhotoHtml(it)}
      <button class="primary" onclick="openCameraContainer(${no})">📷 Chụp ảnh mục này</button>
      <div class="grid2">
        <div class="field"><label>Tỷ lệ đạt</label><input id="cpass_${no}" value="${escapeAttr(it.PASS_RATE)}"></div>
        <div class="field"><label>Tỷ lệ không đạt</label><input id="cfail_${no}" value="${escapeAttr(it.FAIL_RATE)}"></div>
      </div>
      <div class="field"><label>Nhận xét / Remarks</label><textarea id="cremarks_${no}">${escapeHtml(it.REMARKS || '')}</textarea></div>
      <button class="ghost" onclick="saveContainerItem(${no})">Lưu hạng mục</button>
    </div>
  </div>`;
}

async function saveContainerItem(photoNo){
  try{
    const payload = {
      qcFileId: state.current.qcFile.ID,
      photoNo,
      passRate: $(`cpass_${photoNo}`).value,
      failRate: $(`cfail_${photoNo}`).value,
      remarks: $(`cremarks_${photoNo}`).value
    };
    state.current = await api('saveContainerItem', payload);
    setMsg('Đã lưu mục container.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

async function exportPDF(){
  if (!state.current || !state.current.qcFile || !state.current.qcFile.ID) {
    setErr('Chưa chọn hồ sơ QC.');
    renderDetail();
    return;
  }
  try{
    // Gọi thẳng backend (server thật, không bị timeout). Trả về hồ sơ đã cập nhật link PDF.
    state.current = await api('exportPDF', { qcFileId: state.current.qcFile.ID });
    const url = state.current.qcFile.PDF_URL;
    setMsg('Đã tạo PDF xong. Bấm "Mở PDF hiện tại" để xem hoặc tải về.');
    renderDetail();
    // Thử mở tab mới; nếu bị trình duyệt chặn popup thì link "Mở PDF hiện tại" vẫn dùng được.
    if (url) window.open(url, '_blank');
  }catch(err){ setErr(err); renderDetail(); }
}

function openCameraDaily(dailyQcId,itemCode){
  const sess = state.current.dailySessions.find(x => x.ID === dailyQcId);
  const item = sess.items.find(x => x.ITEM_CODE === itemCode);
  cameraTarget = { targetType:'daily', dailyQcId, itemCode, title: item.ITEM_NAME_VI, subtitle: `${sess.QC_DATE} - ${sess.WAREHOUSE}` };
  openCamera();
}
function openCameraContainer(photoNo){
  const it = state.current.containerItems.find(x => Number(x.PHOTO_NO) === Number(photoNo));
  cameraTarget = { targetType:'container', photoNo, title: it.ITEM_NAME_VI, subtitle: it.DESCRIPTION_VI };
  openCamera();
}

async function openCamera(){
  try{
    capturedDataUrl = '';
    $('cameraTitle').textContent = cameraTarget.title;
    $('cameraSub').textContent = cameraTarget.subtitle;
    $('photoPreview').classList.add('hidden');
    $('captureCanvas').classList.add('hidden');
    $('cameraVideo').classList.remove('hidden');
    $('captureBtn').classList.remove('hidden');
    $('retakeBtn').classList.add('hidden');
    $('usePhotoBtn').classList.add('hidden');
    $('cameraModal').classList.remove('hidden');
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    $('cameraVideo').srcObject = cameraStream;
  }catch(err){ alert('Không mở được camera. Hãy kiểm tra quyền camera và dùng HTTPS/Netlify.\n' + err.message); }
}

function closeCamera(){
  if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
  cameraStream = null;
  $('cameraModal').classList.add('hidden');
}

$('closeCamera').addEventListener('click', closeCamera);
$('captureBtn').addEventListener('click', capturePhoto);
$('retakeBtn').addEventListener('click', () => {
  capturedDataUrl = '';
  $('photoPreview').classList.add('hidden');
  $('cameraVideo').classList.remove('hidden');
  $('captureBtn').classList.remove('hidden');
  $('retakeBtn').classList.add('hidden');
  $('usePhotoBtn').classList.add('hidden');
});
$('usePhotoBtn').addEventListener('click', usePhoto);

function capturePhoto(){
  const video = $('cameraVideo');
  const canvas = $('captureCanvas');
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  // Nén theo cạnh dài nhất, không chỉ theo chiều ngang.
  // Ảnh điện thoại thường rất lớn; nếu đưa thẳng vào PDF sẽ làm file nặng.
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const stamp = makeStamp();
  const pad = Math.max(14, Math.round(canvas.width * 0.012));
  const lineH = Math.max(22, Math.round(canvas.width * 0.024));
  const boxH = lineH * stamp.length + pad * 1.4;
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.fillRect(0, canvas.height - boxH, canvas.width, boxH);
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.max(17, Math.round(canvas.width * 0.018))}px Arial`;
  stamp.forEach((line, i) => ctx.fillText(line, pad, canvas.height - boxH + pad + lineH * (i + .65)));

  // Xuất JPG đã nén. Mỗi ảnh thường còn khoảng 120–350KB tùy cảnh chụp.
  capturedDataUrl = canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
  $('photoPreview').src = capturedDataUrl;
  $('photoPreview').classList.remove('hidden');
  $('cameraVideo').classList.add('hidden');
  $('captureBtn').classList.add('hidden');
  $('retakeBtn').classList.remove('hidden');
  $('usePhotoBtn').classList.remove('hidden');
}

function makeStamp(){
  const f = state.current.qcFile;
  return [
    'AGO FRUIT QC',
    `Mã lô / Lot: ${f.LOT_CODE}`,
    `Thời gian / Time: ${formatDateTime(new Date())}`,
    `Mục QC / QC item: ${cameraTarget.title}`,
    `QC: ${f.QC_STAFF || ''}`
  ];
}

async function usePhoto(){
  if(!capturedDataUrl || !cameraTarget) return;
  try{
    const f = state.current.qcFile;
    const capturedAt = formatDateTime(new Date());
    const safeTitle = cameraTarget.title.replace(/[^a-zA-Z0-9À-ỹ]+/g,'-').slice(0,60);
    const fileName = `${f.LOT_CODE}_${safeTitle}_${Date.now()}.jpg`;
    const payload = { qcFileId: f.ID, dataUrl: capturedDataUrl, capturedAt, fileName, ...cameraTarget };
    closeCamera();
    state.current = await api('uploadPhoto', payload);
    setMsg('Đã lưu ảnh vào đúng mục.');
    renderDetail();
  }catch(err){ closeCamera(); setErr(err); renderDetail(); }
}

function savedPhotoHtml(it){
  if (it.PHOTO_URL) {
    return `<a href="${escapeAttr(it.PHOTO_URL)}" target="_blank" title="Bấm để xem ảnh lớn">
        <img src="${escapeAttr(it.PHOTO_URL)}" alt="Ảnh QC" style="width:100%;max-height:300px;object-fit:contain;border:1px solid var(--line);border-radius:10px;background:#f3f4f6;display:block">
      </a>
      <div class="muted" style="margin-top:4px">✅ Đã lưu ảnh${it.CAPTURED_AT ? ' · ' + escapeHtml(it.CAPTURED_AT) : ''} · bấm ảnh để xem lớn</div>`;
  }
  return `<div class="empty-photo">Chưa có ảnh</div>`;
}

function today(){ return new Date().toISOString().slice(0,10); }
function formatDateTime(date){
  const pad = n => String(n).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function escapeHtml(s=''){
  return String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function escapeAttr(s=''){ return escapeHtml(s).replace(/`/g,'&#96;'); }

window.renderCreate = renderCreate;
window.renderList = renderList;
window.openFile = openFile;
window.createQCFile = createQCFile;
window.saveInfo = saveInfo;
window.saveSummary = saveSummary;
window.addDailyQC = addDailyQC;
window.saveDailyItem = saveDailyItem;
window.saveContainerItem = saveContainerItem;
window.openCameraDaily = openCameraDaily;
window.openCameraContainer = openCameraContainer;
window.exportPDF = exportPDF;
window.setSection = setSection;
window.backToMenu = backToMenu;
window.openDailySessionView = openDailySessionView;
window.openDailyItemView = openDailyItemView;
window.openContainerItemView = openContainerItemView;

init();
