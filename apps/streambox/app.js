const urlInput = document.querySelector('#url');
const video = document.querySelector('#video');
const placeholder = document.querySelector('#placeholder');
const errorBox = document.querySelector('#error');
const buffering = document.querySelector('#buffering');
const actions = document.querySelector('#actions');
const download = document.querySelector('#download');
const connection = document.querySelector('#connection');
let resumePosition = Number(localStorage.getItem('stream-position') || 0);

urlInput.value = localStorage.getItem('stream-url') || '';

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function startPlayback() {
  try {
    const source = new URL(urlInput.value);
    if (!['http:', 'https:'].includes(source.protocol)) throw new Error();
    errorBox.hidden = true;
    localStorage.setItem('stream-url', source.href);
    video.src = source.href;
    download.href = source.href;
    placeholder.hidden = true;
    video.hidden = false;
    actions.hidden = false;
    connection.textContent = '⌁ در حال اتصال';
    video.play().catch(() => {});
  } catch {
    showError('لطفاً یک لینک مستقیم و معتبر با http یا https وارد کنید.');
  }
}

document.querySelector('#play').addEventListener('click', startPlayback);
document.querySelector('#clear').addEventListener('click', () => {
  urlInput.value = '';
  video.removeAttribute('src');
  video.load();
  video.hidden = true;
  placeholder.hidden = false;
  actions.hidden = true;
  errorBox.hidden = true;
  localStorage.removeItem('stream-url');
});
document.querySelector('#retry').addEventListener('click', () => {
  resumePosition = video.currentTime;
  video.load();
  video.play().catch(() => {});
});
video.addEventListener('canplay', () => {
  if (resumePosition > 0 && video.currentTime < 1) video.currentTime = resumePosition;
  connection.textContent = '✓ اتصال برقرار';
  buffering.hidden = true;
});
video.addEventListener('waiting', () => { buffering.hidden = false; });
video.addEventListener('playing', () => { buffering.hidden = true; });
video.addEventListener('error', () => {
  connection.textContent = '× قطع ارتباط';
  showError('ارتباط قطع شد. پس از اتصال، «تلاش دوباره» را بزنید تا پخش از همین نقطه ادامه یابد.');
});
setInterval(() => {
  if (video.currentTime) localStorage.setItem('stream-position', String(video.currentTime));
}, 3000);
