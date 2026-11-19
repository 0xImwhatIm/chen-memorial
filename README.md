# 始終美好的母親－陳淑英

這是陳淑英女士的追思網站。親友可以翻閱照片與故事，也能查看龍巖電子訃聞、各場次時間、地址及交通資訊。尚未確認的行程會標為「暫定」，實際安排以家屬通知為準。

## 網站入口

- [故事版｜看照片與故事](https://0ximwhatim.github.io/chen-memorial/?view=story)
- [追思版｜查看行程與交通](https://0ximwhatim.github.io/chen-memorial/?view=editorial)

兩個入口共用一個網站，訪客可在頁首切換版型。相簿支援按年份瀏覽和點圖放大，頁首也可開關音樂。瀏覽器若限制有聲自動播放，可使用「播放音樂」按鈕。

## 留言與紙蓮花

目前照片留言、送出紙蓮花的狀態及顯示偏好，儲存在訪客瀏覽器的 `localStorage`。同一瀏覽器切換故事版和追思版時可讀取同一份資料。換裝置、換瀏覽器或清除網站資料後，原來的紀錄便無法從網站讀取。

紙蓮花目前是該瀏覽器的 0 或 1 朵紀錄。網站目前沒有可供家屬查閱所有留言的後台，也沒有跨裝置的紙蓮花總數。

### 跨裝置儲存方案

可沿用 GitHub Pages 提供頁面，另以 Supabase Postgres 和 Edge Functions 接收留言及紙蓮花。此方案尚未啟用。

| 功能 | 建議流程 |
| --- | --- |
| 照片留言 | 以照片 ID、暱稱、內容和時間存入資料庫。家屬登入後可查看留言，並決定哪些留言公開。 |
| 紙蓮花 | 後端記錄每次成功送出並回傳網站總數。同一瀏覽器用識別碼避免重複送出，後端限制送出頻率。若要做到每人限送一次，需加上身分驗證。 |
| 現有紀錄 | 舊資料分散在各訪客的瀏覽器。若要保留，需要讓仍有原紀錄的訪客自行選擇上傳。 |

家屬帳號和留言審核由後端驗證，公開頁面只讀取已通過的留言及紙蓮花總數。資料庫管理金鑰應放在後端。

## 維護與部署

- `index.html` 包含頁面、相簿索引、行程與互動程式。
- `assets/album/` 存放部分相簿的 WebP 照片。其餘照片及配樂內嵌於頁面。
- `.nojekyll` 讓 GitHub Pages 直接提供靜態檔案。
- 在 repo 根目錄執行 `python3 -m http.server 8000`，開啟本機的 `http://localhost:8000/` 預覽。
- GitHub Pages 從 `main` 分支根目錄發布。更新照片說明或行程後，確認部署成功並檢查兩個公開入口。Google Drive 檔名及說明的變更需要同步到網站內容後才會顯示。

## 來源

- 版型參考 [HTML5 UP Story](https://html5up.net/story)
- 配樂 [Reverie — Scott Buckley](https://www.scottbuckley.com.au/library/reverie/)，以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權，網頁使用重新編碼的 MP3。
- 技術文件 [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) · [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
