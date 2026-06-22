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

// Gọi API có hiện loader (chặn) - dùng cho thao tác cần chờ kết quả.
async function api(action, payload = {}) {
  showLoader('Đang xử lý...');
  try {
    return await apiCore(action, payload);
  } finally {
    hideLoader();
  }
}

// Gọi API KHÔNG hiện loader - dùng cho việc chạy ngầm (vd upload ảnh).
async function apiCore(action, payload = {}) {
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
function setMsg(msg){ state.message = ''; state.error = ''; showToast(msg, 'success'); }
function setErr(err){ state.message = ''; state.error = ''; showToast(String(err && err.message ? err.message : err), 'error'); }
function flash(){ return ''; } // thông báo giờ hiện bằng toast, không còn banner trên thanh

// Toast nổi rồi tự biến mất. Gắn vào body (không vào #app) nên không bị xóa khi vẽ lại màn hình.
function showToast(message, type = 'success'){
  if (!message) return;
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap){ wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  el.onclick = () => dismissToast(el); // bấm để tắt sớm
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => dismissToast(el), type === 'error' ? 5000 : 3000);
}
function dismissToast(el){
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => el.remove(), 250);
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
        <div class="row">
          <button class="primary" onclick="renderCreate('IMPORT')">+ QC hàng nhập</button>
          <button class="primary" onclick="renderCreate('EXPORT')">+ QC hàng xuất</button>
        </div>
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
      <span class="row" style="gap:6px;flex-wrap:nowrap">
        <span class="pill">${qcTypeLabel(f.QC_TYPE)}</span>
        <span class="pill">${escapeHtml(f.STATUS || 'DRAFT')}</span>
      </span>
    </div>
    <div>${escapeHtml(f.PRODUCT_NAME || 'Chưa nhập sản phẩm')}</div>
    <div class="muted">PO: ${escapeHtml(f.PO_NO || '-')} | NCC: ${escapeHtml(f.SUPPLIER || '-')} | Ngày tạo: ${escapeHtml(f.CREATED_AT || '')}</div>
    <div class="row" style="margin-top:6px">
      ${f.PDF_URL ? `<a href="${f.PDF_URL}" target="_blank" onclick="event.stopPropagation()">Mở PDF</a>` : ''}
      <button class="ghost danger small-btn" onclick="event.stopPropagation(); deleteFile('${f.ID}','${escapeAttr(f.LOT_CODE || f.QC_FILE_NO || '')}')">🗑 Xóa hồ sơ</button>
    </div>
  </div>`;
}

let createType = 'IMPORT';
function qcTypeLabel(t){ return t === 'EXPORT' ? 'Hàng xuất' : 'Hàng nhập'; }

function renderCreate(qcType){
  createType = (qcType === 'EXPORT') ? 'EXPORT' : 'IMPORT';
  const label = qcTypeLabel(createType);
  app.innerHTML = `${flash()}
    <div class="card">
      <div class="between"><h2>Tạo hồ sơ ${label}</h2><button class="ghost" onclick="renderList()">Quay lại</button></div>
      <div class="note">Loại: <b>${label}</b>. Mã hồ sơ QC và mã lô sẽ tự tạo theo PO và ngày tạo.</div>
      <form id="createForm" class="stack" onsubmit="createQCFile(event)">
        ${infoFieldsHtml({}, createType)}
        <button class="primary full" type="submit">Tạo hồ sơ ${label}</button>
      </form>
    </div>`;
}

function infoFieldsHtml(f = {}, qcType){
  const type = qcType || f.QC_TYPE || 'IMPORT';
  if (type === 'IMPORT') {
    // Hàng nhập (nhập khẩu): bỏ trường sản xuất, đổi nhãn cho phù hợp.
    return `<div class="grid2">
      ${input('contractNo','Hợp đồng / Invoice', f.CONTRACT_NO)}
      ${input('poNo','Số PO / Tham chiếu', f.PO_NO, true)}
      ${input('supplier','Nhà cung cấp / Người xuất khẩu', f.SUPPLIER)}
      ${input('supplierCode','Mã NCC / Supplier code', f.SUPPLIER_CODE)}
      ${input('productName','Tên hàng / Product name', f.PRODUCT_NAME, true)}
      ${input('specification','Quy cách/Size/Grade', f.SPECIFICATION)}
      ${input('poQuantity','Số lượng', f.PO_QUANTITY)}
      ${input('unit','Đơn vị tính / Unit', f.UNIT)}
      ${input('containerNo','Số container / Container no.', f.CONTAINER_NO)}
      ${input('sealNo','Số seal / Seal no.', f.SEAL_NO)}
      ${input('containerLoadingDate','Ngày hàng về / Arrival date', f.CONTAINER_LOADING_DATE, false, 'date')}
      ${input('qcStaff','Nhân viên QC / QC staff', f.QC_STAFF, true)}
    </div>`;
  }
  // Hàng xuất: form đầy đủ như cũ.
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
    p.qcType = createType;
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
        <span class="pill">${qcTypeLabel(f.QC_TYPE)}</span>
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
  const isImport = state.current && state.current.qcFile && state.current.qcFile.QC_TYPE === 'IMPORT';
  // Hàng nhập: đưa mục "Hình ảnh container" lên trước "QC hàng ngày".
  const items = isImport ? [
    ['info','A. Thông tin lô hàng','Lot information'],
    ['summary','B. Thống kê','Summary'],
    ['container','C. Hình ảnh container','Container photos'],
    ['daily','D. QC chất lượng','Quality check'],
    ['export','E. Xuất PDF','Export PDF']
  ] : [
    ['info','A. Thông tin lô hàng','Lot information'],
    ['summary','B. Thống kê','Summary'],
    ['daily','C. QC chất lượng','Quality check'],
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
  const f = d.qcFile;
  return `<div class="card">
    <h3>Xuất file PDF</h3>
    <div class="note">Bấm xuất, chờ vài giây. Lần đầu trong ngày có thể lâu hơn vì server vừa thức dậy. Tạo xong, link PDF hiện ngay bên dưới.</div>
    <div class="actions" style="margin-top:10px">
      <button class="primary" onclick="exportPDF('internal')">📄 Xuất PDF</button>
      ${f.PDF_URL ? `<a class="ghost" href="${f.PDF_URL}" target="_blank">Mở PDF hiện tại</a>` : ''}
    </div>
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
      ${input('cumulativePassRate','Tỷ lệ đạt / Pass rate', s.CUMULATIVE_PASS_RATE)}
      ${input('cumulativeFailRate','Tỷ lệ không đạt / Fail rate', s.CUMULATIVE_FAIL_RATE)}
      <div class="field"><label>Lý do không đạt / Reason for failure</label><textarea name="failReason">${escapeHtml(s.FAIL_REASON || '')}</textarea></div>
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
    <div class="between"><h3>QC chất lượng / Quality check</h3><button class="ghost small-btn" onclick="backToMenu()">Về đầu mục</button></div>
    <form class="row" style="align-items:flex-end" onsubmit="addDailyQC(event)">
      ${input('qcDate','Ngày QC / QC date', today(), true, 'date')}
      <button class="primary" type="submit">+ Thêm đợt QC</button>
    </form>
    <div class="section-title">Danh sách đợt QC</div>
    <div class="stack">
      ${d.dailySessions.length ? d.dailySessions.map(renderDailySessionCard).join('') : '<div class="note">Chưa có ngày QC.</div>'}
    </div>
  </div>`;
}

function renderDailySessionCard(sess){
  const photos = (sess.items || []).filter(x => x.PHOTO_FILE_ID || x.PHOTO_URL).length;
  const filled = (sess.items || []).filter(x => x.PASS_RATE || x.FAIL_RATE || x.REMARKS).length;
  return `<div class="file-item" onclick="openDailySessionView('${sess.ID}')">
    <div class="between"><b>QC ${escapeHtml(sess.QC_DATE)}</b><span class="pill">${photos}/6 ảnh</span></div>
    <div class="muted">Đã nhập: ${filled}/6 hạng mục</div>
  </div>`;
}

function renderDailySessionDetail(d){
  const sess = d.dailySessions.find(x => x.ID === state.activeDailyId);
  if (!sess) { state.activeDailyId = null; return renderDailySection(d); }
  if (state.activeDailyItemCode) return renderDailyItemDetail(sess);
  return `<div class="card">
    <div class="between"><h3>QC ${escapeHtml(sess.QC_DATE)}</h3><button class="ghost small-btn" onclick="state.activeDailyId=null;renderDetail()">Quay lại danh sách</button></div>
    <div class="note">Chọn từng hạng mục để mở màn hình nhập riêng. Có thể sửa ngày của đợt QC ngay bên dưới.</div>
    <form id="editDailyForm" class="grid2" style="margin:8px 0">
      ${input('qcDate','Ngày QC / QC date', sess.QC_DATE, false, 'date')}
    </form>
    <div class="row" style="margin-bottom:8px">
      <button class="ghost small-btn" onclick="saveSession('${sess.ID}')">Lưu sửa phiên</button>
      <button class="ghost danger small-btn" onclick="deleteSession('${sess.ID}')">🗑 Xóa phiên này</button>
    </div>
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
    <div class="muted">${escapeHtml(it.ITEM_NAME_EN)} | QC ${escapeHtml(sess.QC_DATE)}</div>
    <div class="qc-body single-form">
      ${savedPhotoHtml(it)}
      <div class="row">
        <button class="primary" onclick="openCameraDaily('${sess.ID}','${it.ITEM_CODE}')">📷 ${hasPhoto ? 'Chụp lại' : 'Chụp ảnh mục này'}</button>
        ${hasPhoto ? `<button class="ghost danger" onclick="deletePhotoDaily('${sess.ID}','${it.ITEM_CODE}')">🗑 Xóa ảnh</button>` : ''}
      </div>
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
      <div class="row">
        <button class="primary" onclick="openCameraContainer(${no})">📷 ${hasPhoto ? 'Chụp lại' : 'Chụp ảnh mục này'}</button>
        ${hasPhoto ? `<button class="ghost danger" onclick="deletePhotoContainer(${no})">🗑 Xóa ảnh</button>` : ''}
      </div>
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

async function exportPDF(variant){
  if (!state.current || !state.current.qcFile || !state.current.qcFile.ID) {
    setErr('Chưa chọn hồ sơ QC.');
    renderDetail();
    return;
  }
  const isCustomer = variant === 'customer';
  try{
    // Gọi thẳng backend, kèm loại bản (nội bộ / khách hàng). Trả về hồ sơ đã cập nhật link PDF.
    state.current = await api('exportPDF', { qcFileId: state.current.qcFile.ID, variant });
    const url = isCustomer ? state.current.qcFile.PDF_URL_CUSTOMER : state.current.qcFile.PDF_URL;
    setMsg(isCustomer ? 'Đã tạo PDF khách hàng. Bấm "Mở bản khách hàng" để xem/tải.' : 'Đã tạo PDF. Bấm "Mở PDF hiện tại" để xem/tải.');
    renderDetail();
    // Thử mở tab mới; nếu bị chặn popup thì link bên dưới vẫn dùng được.
    if (url) window.open(url, '_blank');
  }catch(err){ setErr(err); renderDetail(); }
}

function openCameraDaily(dailyQcId,itemCode){
  const sess = state.current.dailySessions.find(x => x.ID === dailyQcId);
  const item = sess.items.find(x => x.ITEM_CODE === itemCode);
  cameraTarget = { targetType:'daily', dailyQcId, itemCode, title: item.ITEM_NAME_VI, subtitle: `QC ${sess.QC_DATE}` };
  startCapture();
}
function openCameraContainer(photoNo){
  const it = state.current.containerItems.find(x => Number(x.PHOTO_NO) === Number(photoNo));
  cameraTarget = { targetType:'container', photoNo, title: it.ITEM_NAME_VI, subtitle: it.DESCRIPTION_VI };
  startCapture();
}

// Mở camera điện thoại qua input file (ổn định trong trình duyệt-trong-app Zalo/Telegram/Facebook).
// KHÔNG dùng getUserMedia (hay crash/đóng webview).
function startCapture(){
  const input = $('cameraInput');
  input.value = ''; // reset để chụp lại cùng mục vẫn kích hoạt onchange
  input.click();
}

// Sau khi người dùng chụp xong từ camera điện thoại.
async function handleCaptureFile(e){
  const file = e.target.files && e.target.files[0];
  if (!file || !cameraTarget) return;
  showLoader('Đang xử lý ảnh...');
  try{
    capturedDataUrl = await processCaptureFile(file);
    // Hiện popup XEM LẠI để chốt: bấm "Sử dụng ảnh" (lưu) hoặc "Chụp lại".
    $('cameraTitle').textContent = cameraTarget.title;
    $('cameraSub').textContent = cameraTarget.subtitle;
    $('photoPreview').src = capturedDataUrl;
    $('photoPreview').classList.remove('hidden');
    $('cameraModal').classList.remove('hidden');
  }catch(err){
    showToast('Không xử lý được ảnh, hãy chụp lại.', 'error');
  }finally{
    hideLoader();
  }
}

// Đọc file ảnh -> giảm kích thước -> đóng dấu -> trả dataURL JPG.
// Có giới hạn thời gian để không bị "đứng" mãi nếu webview xử lý ảnh nặng bị lỗi.
function processCaptureFile(file){
  return Promise.race([
    decodeAndStamp(file),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('Xử lý ảnh quá lâu. Hãy thử chụp lại.')), 30000)),
  ]);
}

async function decodeAndStamp(file){
  const drawable = await decodeImage(file);
  const w = drawable.width || drawable.naturalWidth || 1280;
  const h = drawable.height || drawable.naturalHeight || 720;
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(w, h));
  const canvas = $('captureCanvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
  if (drawable.close) drawable.close(); // giải phóng bitmap khỏi bộ nhớ
  drawStamp(ctx, canvas);
  return canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
}

// Giải mã ảnh. Ưu tiên createImageBitmap (nhanh, ít tốn bộ nhớ, không cần objectURL)
// và giảm kích thước NGAY khi giải mã -> tránh treo với ảnh máy ảnh 12MP.
function decodeImage(file){
  if (typeof createImageBitmap === 'function'){
    return createImageBitmap(file, { resizeWidth: PHOTO_MAX_SIDE, resizeQuality: 'high', imageOrientation: 'from-image' })
      .catch(() => createImageBitmap(file))   // webview không nhận option -> giải mã thường
      .catch(() => decodeViaImage(file));      // không hỗ trợ createImageBitmap -> dùng Image
  }
  return decodeViaImage(file);
}

function decodeViaImage(file){
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Ảnh không hợp lệ')); };
    img.src = url;
  });
}

// Đóng dấu mã lô / thời gian / nhân viên QC vào góc dưới ảnh.
function drawStamp(ctx, canvas){
  const stamp = makeStamp();
  const pad = Math.max(14, Math.round(canvas.width * 0.012));
  const lineH = Math.max(22, Math.round(canvas.width * 0.024));
  const boxH = lineH * stamp.length + pad * 1.4;
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.fillRect(0, canvas.height - boxH, canvas.width, boxH);
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.max(17, Math.round(canvas.width * 0.018))}px Arial`;
  stamp.forEach((line, i) => ctx.fillText(line, pad, canvas.height - boxH + pad + lineH * (i + .65)));
}

function closeCamera(){
  $('cameraModal').classList.add('hidden');
  $('photoPreview').src = '';        // giải phóng bộ nhớ ảnh
  $('photoPreview').classList.add('hidden');
  $('cameraInput').value = '';
  capturedDataUrl = '';
}

$('closeCamera').addEventListener('click', closeCamera);
$('cameraInput').addEventListener('change', handleCaptureFile);
$('retakeBtn').addEventListener('click', startCapture);
$('usePhotoBtn').addEventListener('click', usePhoto);

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

// Tìm 1 mục ảnh trong một bộ dữ liệu hồ sơ (state.current hoặc kết quả API trả về).
function findPhotoItemIn(data, target){
  if (!data || !target) return null;
  if (target.targetType === 'daily') {
    const sess = (data.dailySessions || []).find(s => s.ID === target.dailyQcId);
    return sess ? (sess.items || []).find(it => it.ITEM_CODE === target.itemCode) : null;
  }
  if (target.targetType === 'container') {
    return (data.containerItems || []).find(it => Number(it.PHOTO_NO) === Number(target.photoNo));
  }
  return null;
}

async function usePhoto(){
  if(!capturedDataUrl || !cameraTarget) return;
  const f = state.current.qcFile;
  const target = cameraTarget;            // giữ tham chiếu cục bộ (camera sắp đóng)
  const dataUrl = capturedDataUrl;
  const capturedAt = formatDateTime(new Date());
  const safeTitle = target.title.replace(/[^a-zA-Z0-9À-ỹ]+/g,'-').slice(0,60);
  const fileName = `${f.LOT_CODE}_${safeTitle}_${Date.now()}.jpg`;
  const payload = { qcFileId: f.ID, dataUrl, capturedAt, fileName, ...target };

  // 1) HIỆN ẢNH NGAY (lạc quan) + đóng camera. Không bắt người dùng chờ mạng.
  const item = findPhotoItemIn(state.current, target);
  const prevUrl = item ? (item.PHOTO_URL || '') : '';
  const prevCaptured = item ? (item.CAPTURED_AT || '') : '';
  if (item){ item.PHOTO_URL = dataUrl; item.CAPTURED_AT = capturedAt; }
  closeCamera();
  renderDetail();

  // 2) UPLOAD NGẦM (không loader). Xong thì thay bằng link thật; lỗi thì hoàn lại + báo.
  try {
    const updated = await apiCore('uploadPhoto', payload);
    if (state.current && state.current.qcFile.ID === f.ID){
      const real = findPhotoItemIn(updated, target);
      const cur = findPhotoItemIn(state.current, target);
      if (real && cur){
        cur.PHOTO_URL = real.PHOTO_URL;
        cur.PHOTO_PATH = real.PHOTO_PATH;
        cur.CAPTURED_AT = real.CAPTURED_AT;
        renderDetail();
      }
    }
    showToast('Đã lưu ảnh ✓', 'success');
  } catch (err) {
    // Upload lỗi: hoàn lại ảnh cũ (nếu còn ở đúng hồ sơ) và báo để chụp lại.
    if (state.current && state.current.qcFile.ID === f.ID){
      const cur = findPhotoItemIn(state.current, target);
      if (cur){ cur.PHOTO_URL = prevUrl; cur.CAPTURED_AT = prevCaptured; renderDetail(); }
    }
    showToast('Ảnh CHƯA lưu được. Hãy chụp lại.', 'error');
  }
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

async function deleteFile(id, lot){
  if (!confirm(`Xóa hồ sơ "${lot}"?\nToàn bộ ngày QC, ảnh và thống kê của hồ sơ này sẽ bị xóa và KHÔNG khôi phục được.`)) return;
  try{
    await api('deleteQCFile', { qcFileId: id });
    setMsg('Đã xóa hồ sơ.');
    await loadFiles();
  }catch(err){ setErr(err); renderList(); }
}

async function saveSession(dailyQcId){
  try{
    const p = getFormData($('editDailyForm'));
    p.dailyQcId = dailyQcId;
    state.current = await api('updateDailyQC', p);
    setMsg('Đã lưu sửa phiên QC.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

async function deleteSession(dailyQcId){
  if (!confirm('Xóa phiên QC này? Các hạng mục và ảnh trong phiên sẽ bị xóa.')) return;
  try{
    state.current = await api('deleteDailyQC', { dailyQcId });
    state.activeDailyId = null;
    setMsg('Đã xóa phiên QC.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

async function deletePhotoDaily(dailyQcId, itemCode){
  if (!confirm('Xóa ảnh của mục này?')) return;
  try{
    state.current = await api('deletePhoto', { targetType:'daily', dailyQcId, itemCode });
    setMsg('Đã xóa ảnh.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

async function deletePhotoContainer(photoNo){
  if (!confirm('Xóa ảnh của mục này?')) return;
  try{
    state.current = await api('deletePhoto', { targetType:'container', qcFileId: state.current.qcFile.ID, photoNo });
    setMsg('Đã xóa ảnh.');
    renderDetail();
  }catch(err){ setErr(err); renderDetail(); }
}

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
window.deleteFile = deleteFile;
window.saveSession = saveSession;
window.deleteSession = deleteSession;
window.deletePhotoDaily = deletePhotoDaily;
window.deletePhotoContainer = deletePhotoContainer;

// Đăng ký service worker để app cài được như app (PWA).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

init();
