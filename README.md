# 始終美好的母親－陳淑英

這是陳淑英女士的追思網站。親友可以翻閱照片與故事，也能查看龍巖電子訃聞、各場次時間、地址及交通資訊。尚未確認的行程會標為「暫定」，實際安排以家屬通知為準。

## 網站入口

- [故事版｜看照片與故事](https://0ximwhatim.github.io/chen-memorial/?view=story)
- [追思版｜查看行程與交通](https://0ximwhatim.github.io/chen-memorial/?view=editorial)

兩個入口共用一個網站，訪客可在頁首切換版型。相簿支援按年份瀏覽和點圖放大，頁首也可開關音樂。瀏覽器若限制有聲自動播放，可使用「播放音樂」按鈕。

## 留言與紙蓮花

- **照片留言**會送到共用資料庫，家屬審核通過後才會顯示在對應照片下方。
- **紙蓮花**可重複贈送。每次成功送出會增加全站總數。網路逾時後重試同一筆送出時只計一次。
- [留言管理](https://chen-memorial-guestbook.mr-slowcore.chatgpt.site/admin) 需以有管理權限的 ChatGPT 帳號登入，可查看待審核、已公開或已隱藏的留言。
- 舊版留下的留言仍可在原瀏覽器查看。舊版紙蓮花紀錄分散於各瀏覽器，全站計數自啟用共享功能起累加。

網站由 GitHub Pages 發布，留言服務運行於 Sites，資料儲存在 D1。公開端點只提供已核准的留言及紙蓮花總數。留言審核與管理權限由伺服器驗證。

## 維護與部署

- `index.html` 包含頁面、相簿索引、行程與互動程式。
- `assets/album/` 存放部分相簿的 WebP 照片。其餘照片及配樂內嵌於頁面。
- `.nojekyll` 讓 GitHub Pages 直接提供靜態檔案。
- 在 repo 根目錄執行 `python3 -m http.server 8000`，開啟本機的 `http://localhost:8000/` 預覽。
- GitHub Pages 從 `main` 分支根目錄發布。更新照片說明或行程後，確認部署成功並檢查兩個公開入口。Google Drive 檔名及說明的變更需要同步到網站內容後才會顯示。

## 來源

- 版型參考 [HTML5 UP Story](https://html5up.net/story)
- 配樂 [Reverie — Scott Buckley](https://www.scottbuckley.com.au/library/reverie/)，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，網頁使用重新編碼的 MP3。
- 技術文件 [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

