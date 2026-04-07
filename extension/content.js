(function() {
  console.log("Threads Automation Extension Loaded");

  // Lắng nghe message từ popup
  window.addEventListener('message', async (event) => {
    if (event.data && event.data.type === 'THREADS_START_CAPTURE') {
      const count = event.data.count;
      await performCapture(count);
    }
  });

  async function performCapture(count) {
    try {
      // 1. Tìm container chính của Profile (Dựa trên class bạn cung cấp)
      const container = document.querySelector('div.x1a8lsjc.xyamay9.x8tz501.x1rdv6da');
      if (!container) {
        alert("Không tìm thấy vùng Profile. Hãy chắc chắn bạn đang ở trang cá nhân Threads.");
        return;
      }

      // 2. Fake số Follower (Logic tìm theo text "followers")
      const spans = container.querySelectorAll('span');
      for (let span of spans) {
        if (span.textContent.toLowerCase().includes('followers')) {
          const titleSpan = span.querySelector('span[title]');
          if (titleSpan) {
            titleSpan.textContent = count;
            titleSpan.title = count;
          } else {
            // Trường hợp Threads thay đổi cấu trúc, thay đổi trực tiếp text đầu tiên là số
            span.innerHTML = span.innerHTML.replace(/^[0-9.,KMB]+/, count);
          }
          break;
        }
      }

      // 3. Tìm Link Telegram và vẽ hiệu ứng
      const links = container.querySelectorAll('a');
      let targetLink = null;
      for (let link of links) {
         if (link.textContent.toLowerCase().includes('t.me')) {
           targetLink = link;
           break;
         }
      }

      if (targetLink) {
        container.querySelectorAll('.threads-tool-overlay').forEach(el => el.remove());

        const rect = targetLink.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const relTop = rect.top - containerRect.top;
        const relLeft = rect.left - containerRect.left;

        // Vòng tròn elip đỏ
        const ellipse = document.createElement('div');
        ellipse.className = 'threads-tool-overlay';
        Object.assign(ellipse.style, {
          position: 'absolute',
          top: `${relTop - 10}px`,
          left: `${relLeft - 20}px`,
          width: `${rect.width + 40}px`,
          height: `${rect.height + 20}px`,
          border: '5px solid #ff3b30',
          borderRadius: '50% / 50%',
          transform: 'rotate(-1.5deg)',
          pointerEvents: 'none',
          zIndex: '9999'
        });

        // Bàn tay chỉ vào - Xử lý tách nền trắng tự động
        const hand = document.createElement('img');
        hand.className = 'threads-tool-overlay';
        
        // Hàm tách nền trắng - Cải tiến để xóa sạch đốm trắng li ti
        const processHandImage = (url) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imgData.data;
              // Ngưỡng xóa màu trắng mạnh hơn (hạ xuống 200 để bắt được các đốm xám nhạt)
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                if (r > 200 && g > 200 && b > 200) {
                  data[i+3] = 0; 
                }
              }
              ctx.putImageData(imgData, 0, 0);
              resolve(canvas.toDataURL());
            };
            img.src = url;
          });
        };

        const transparentHandUrl = await processHandImage(chrome.runtime.getURL('hand.png'));
        hand.src = transparentHandUrl;

        Object.assign(hand.style, {
          position: 'absolute',
          top: `${relTop - 115}px`, // Xuống thêm 5px (-120 + 5 = -115)
          left: `${relLeft + rect.width + 30}px`, 
          width: '140px', 
          height: 'auto',
          transform: 'rotate(35deg)', 
          pointerEvents: 'none',
          zIndex: '9999',
          filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.5))'
        });

        if (window.getComputedStyle(container).position === 'static') {
          container.style.position = 'relative';
        }

        container.appendChild(ellipse);
        container.appendChild(hand);
      }

      // 4. Chụp ảnh chất lượng cao
      setTimeout(async () => {
        const canvas = await html2canvas(container, {
          backgroundColor: '#101010',
          scale: 3,
          useCORS: true,
          logging: false,
          allowTaint: true
        });

        const dataUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement('a');
        downloadLink.download = `threads_captured_${Date.now()}.png`;
        downloadLink.href = dataUrl;
        downloadLink.click();
      }, 300);

    } catch (err) {
      console.error("Capture Error:", err);
      alert("Lỗi: " + err.message);
    }
  }
})();
