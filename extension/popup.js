document.getElementById('btnCapture').addEventListener('click', async () => {
  const followerCount = document.getElementById('followerCount').value;
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const isThreads = tab.url.includes('threads.net') || tab.url.includes('threads.com');
  
  if (isThreads) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runAutomation,
      args: [followerCount]
    });
  } else {
    alert('Vui lòng mở trang Threads trước!');
  }
});

function runAutomation(count) {
  // Gửi sự kiện cho content.js thông qua window messaging hoặc direct execution
  // Ở đây content.js đã được inject sẵn theo manifest, chúng ta có thể gọi function trực tiếp nếu dùng executeScript chuyên sâu
  // Hoặc dùng custom event như sau:
  window.postMessage({ type: 'THREADS_START_CAPTURE', count }, '*');
}
