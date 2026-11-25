import type { Lang } from "../lib/taxonomy";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
};

export const legalSlugs = ["privacy", "terms", "affiliate-disclosure", "not-financial-advice"] as const;
export type LegalSlug = (typeof legalSlugs)[number];

const privacyHant: LegalDocument = {
  title: "私隱政策",
  description: "Mia 私隱政策草案：靜態網站、本機點擊紀錄，以及未啟用的 Analytics。",
  intro: "這份草案說明現時這個靜態網站會碰到哪些資料。它還沒有法律實體名稱，也還沒有生效日期。",
  sections: [
    {
      heading: "閱讀這個網站不必建立帳戶",
      paragraphs: [
        "沒有會員註冊，沒有密碼，也沒有要求你提交身分證、電話或電郵才能看比較表。",
        "聯絡電郵尚未設定。設定之後，你若用自己的電郵軟件寫信給我們，那封信的內容由你的電郵供應商與收件設定處理，不是由這份靜態頁面儲存。",
      ],
    },
    {
      heading: "回贈查詢",
      paragraphs: [
        "你輸入的參考編號會在你的瀏覽器裡，與建置時已經放進頁面的資料檔比對。這次比對預設不會另開一個查詢送到我們的伺服器，因為網站沒有應用伺服器。",
        "資料檔是公開的。它只應包含參考編號、顯示名稱、狀態與備註。請不要把真實姓名、電話、電郵或身分證號放進這個檔。知道編號的人可以讀到該筆狀態。",
      ],
    },
    {
      heading: "申請轉頁",
      paragraphs: [
        "申請按鈕會打開本站的 /go/ 轉頁。若瀏覽器允許，轉頁會把卡片代號、channel、post、時間，以及是否已有目的地，寫入本機 localStorage，鍵名是 mia.outboundClicks，最多保留最近 200 筆。",
        "同一時間會送出名為 affiliate_outbound 的事件。只有在建置時設定了 Google Analytics 測量編號，這個事件才會交給 Google。未設定時，它只留在瀏覽器的 dataLayer。",
        "若建置時另外設定了 https webhook，瀏覽器會用 sendBeacon 送出同一份文字。未設定時不會發送。轉頁不會從網址列讀取目的地，避免被人改寫成任意外站。",
      ],
    },
    {
      heading: "Analytics 與 Search Console",
      paragraphs: [
        "Google Analytics 的程式只在建置環境變數 PUBLIC_GA_MEASUREMENT_ID 是一個有效的 GA4 編號時才會載入。倉庫裡沒有填入任何編號，所以現時的頁面不會載入這個程式。",
        "Search Console 的驗證碼來自 PUBLIC_GSC_VERIFICATION。它是給 Google 確認網站擁有權的 meta 標籤，本身不是訪客清單。未設定時，頁面不會輸出這個標籤。",
      ],
    },
    {
      heading: "託管",
      paragraphs: [
        "頁面託管在 GitHub Pages。GitHub 可能按其本身的做法記錄技術日誌。我們不營運該日誌，也不能在這個靜態網站裡關掉它。",
        "本站不使用廣告網絡，也不把比較表的篩選結果賣給任何人。",
      ],
    },
    {
      heading: "保留與你的選擇",
      paragraphs: [
        "mia.outboundClicks 留在你的瀏覽器。清除這個網站的網站資料即可刪除。",
        "示範回贈紀錄不是真實客戶。真實編號若日後出現在公開資料檔，知道編號的人都能查看，所以編號應難以猜測，並且不應包含個人資料。",
      ],
    },
    {
      heading: "兒童",
      paragraphs: ["這個網站不是為兒童而設，也不明知地向兒童收集資料。"],
    },
    {
      heading: "修訂",
      paragraphs: [
        "正式文本須由法律顧問按香港《個人資料（私隱）條例》覆核，並補上營運者名稱、聯絡方式與生效日期。在那之前，這份草案只描述這個預覽站的實際行為。",
      ],
    },
  ],
};

const privacyHans: LegalDocument = {
  title: "隐私政策",
  description: "Mia 隐私政策草案：静态网站、本地点击记录，以及未启用的 Analytics。",
  intro: "这份草案说明目前这个静态网站会碰到哪些资料。它还没有法律实体名称，也还没有生效日期。",
  sections: [
    {
      heading: "阅读这个网站不必建立账户",
      paragraphs: [
        "没有会员注册，没有密码，也没有要求你提交身份证、电话或邮箱才能看比较表。",
        "联系邮箱尚未设置。设置之后，你若用自己的邮件软件写信给我们，那封信的内容由你的邮件服务商和收件设置处理，不是由这份静态页面储存。",
      ],
    },
    {
      heading: "回赠查询",
      paragraphs: [
        "你输入的参考编号会在你的浏览器里，与构建时已经放进页面的数据文件比对。这次比对默认不会另开一个查询送到我们的服务器，因为网站没有应用服务器。",
        "数据文件是公开的。它只应包含参考编号、显示名称、状态和备注。请不要把真实姓名、电话、邮箱或身份证号放进这个文件。知道编号的人可以读到该笔状态。",
      ],
    },
    {
      heading: "申请跳转页",
      paragraphs: [
        "申请按钮会打开本站的 /go/ 跳转页。若浏览器允许，跳转页会把卡片代号、channel、post、时间，以及是否已有目的地，写入本地 localStorage，键名是 mia.outboundClicks，最多保留最近 200 笔。",
        "同一时间会送出名为 affiliate_outbound 的事件。只有在构建时设置了 Google Analytics 测量编号，这个事件才会交给 Google。未设置时，它只留在浏览器的 dataLayer。",
        "若构建时另外设置了 https webhook，浏览器会用 sendBeacon 送出同一份文字。未设置时不会发送。跳转页不会从网址栏读取目的地，避免被人改写成任意外站。",
      ],
    },
    {
      heading: "Analytics 与 Search Console",
      paragraphs: [
        "Google Analytics 的程序只在构建环境变量 PUBLIC_GA_MEASUREMENT_ID 是一个有效的 GA4 编号时才会加载。仓库里没有填入任何编号，所以目前的页面不会加载这个程序。",
        "Search Console 的验证码来自 PUBLIC_GSC_VERIFICATION。它是给 Google 确认网站所有权的 meta 标签，本身不是访客清单。未设置时，页面不会输出这个标签。",
      ],
    },
    {
      heading: "托管",
      paragraphs: [
        "页面托管在 GitHub Pages。GitHub 可能按其本身的做法记录技术日志。我们不运营该日志，也不能在这个静态网站里关掉它。",
        "本站不使用广告网络，也不把比较表的筛选结果卖给任何人。",
      ],
    },
    {
      heading: "保留与你的选择",
      paragraphs: [
        "mia.outboundClicks 留在你的浏览器。清除这个网站的站点数据即可删除。",
        "示范回赠记录不是真实客户。真实编号若日后出现在公开数据文件，知道编号的人都能查看，所以编号应难以猜测，并且不应包含个人资料。",
      ],
    },
    {
      heading: "儿童",
      paragraphs: ["这个网站不是为儿童而设，也不明知地向儿童收集资料。"],
    },
    {
      heading: "修订",
      paragraphs: [
        "正式文本须由法律顾问按香港《个人资料（私隐）条例》复核，并补上运营者名称、联系方式与生效日期。在那之前，这份草案只描述这个预览站的实际行为。",
      ],
    },
  ],
};

const termsHant: LegalDocument = {
  title: "使用條款",
  description: "Mia 使用條款草案：資訊性質、外部連結與責任界限。",
  intro: "使用這個預覽站，即表示你明白它仍是草案，而且卡片條款尚未上載。",
  sections: [
    {
      heading: "網站是什麼",
      paragraphs: [
        "Mia 是信用卡比較與一般資訊網站，不是銀行，不是卡的發行機構，也不是你的代理人。",
        "比較表裡標示待補的欄位是空白。空白不是一項優惠，也不構成任何人向你發出的要約。",
      ],
    },
    {
      heading: "資料可能不完整",
      paragraphs: [
        "即使某列日後標成已發佈，它仍是摘要。發行機構的最新條款、收費表與申請頁才是交易文件。兩者不符時，以發行機構的文件為準。",
        "我們不承諾頁面沒有遺漏，也不承諾某一天的數字第二天仍然正確。每列可以有自己的更新日期；沒有日期就是尚未發佈。",
      ],
    },
    {
      heading: "批核與外部網站",
      paragraphs: [
        "任何申請的批核、信用額、迎新資格與實際利息，都由你離開本站之後的機構決定。本站不能代替該決定。",
        "轉頁上的外部連結一旦開通，那個網站有自己的條款。請在那裡再讀一次你要同意的內容。",
      ],
    },
    {
      heading: "聯盟連結",
      paragraphs: [
        "開通之後，Mia 可能因合資格的申請獲得介紹費。這不會改寫發行機構給你的條款。排序規則見聯盟披露草案。",
        "現時沒有已填入的申請網址，因此沒有可以由此計費的連結。",
      ],
    },
    {
      heading: "可接受的使用",
      paragraphs: [
        "不要把本站說成某家銀行或卡組織的官方網站。不要向資料檔加入別人的個人資料。不要嘗試把轉頁的目的地改寫成與該卡無關的網址。",
      ],
    },
    {
      heading: "知識產權",
      paragraphs: [
        "Mia 這個名稱、版面與我們撰寫的文字，在正式營運者確定後由其持有或獲授權使用。卡組織的名稱屬於各自的權利人，本站用來描述卡種，不表示存在贊助或授權關係。",
      ],
    },
    {
      heading: "責任",
      paragraphs: [
        "在法律允許的範圍內，本站對你因使用這些摘要而做的決定不承擔責任。這句話沒有排除法律不允許排除的責任。",
        "預期適用的法律是香港法律，爭議的處理方式待法律顧問確認。在草案階段，這不是一份已經談妥司法管轄的正式合同。",
      ],
    },
    {
      heading: "修訂",
      paragraphs: ["條款更新後會改草案日期，並在補上生效日期後才視為正式版本。繼續使用更新後的網站，表示你閱讀的是當時頁面上的那一版。"],
    },
  ],
};

const termsHans: LegalDocument = {
  title: "使用条款",
  description: "Mia 使用条款草案：信息性质、外部链接和责任界限。",
  intro: "使用这个预览站，即表示你明白它仍是草案，而且卡片条款尚未上传。",
  sections: [
    {
      heading: "网站是什么",
      paragraphs: [
        "Mia 是信用卡比较和一般信息网站，不是银行，不是卡的发卡机构，也不是你的代理人。",
        "比较表里标示待补的字段是空白。空白不是一项优惠，也不构成任何人向你发出的要约。",
      ],
    },
    {
      heading: "资料可能不完整",
      paragraphs: [
        "即使某行日后标成已发布，它仍是摘要。发卡机构的最新条款、收费表和申请页才是交易文件。两者不符时，以发卡机构的文件为准。",
        "我们不承诺页面没有遗漏，也不承诺某一天的数字第二天仍然正确。每行可以有自己的更新日期；没有日期就是尚未发布。",
      ],
    },
    {
      heading: "审批与外部网站",
      paragraphs: [
        "任何申请的审批、信用额、迎新资格和实际利息，都由你离开本站之后的机构决定。本站不能代替该决定。",
        "跳转页上的外部链接一旦开通，那个网站有自己的条款。请在那里再读一次你要同意的内容。",
      ],
    },
    {
      heading: "联盟链接",
      paragraphs: [
        "开通之后，Mia 可能因合资格的申请获得介绍费。这不会改写发卡机构给你的条款。排序规则见联盟披露草案。",
        "目前没有已填入的申请网址，因此没有可以由此计费的链接。",
      ],
    },
    {
      heading: "可接受的使用",
      paragraphs: [
        "不要把本站说成某家银行或卡组织的官方网站。不要向数据文件加入别人的个人资料。不要尝试把跳转页的目的地改写成与该卡无关的网址。",
      ],
    },
    {
      heading: "知识产权",
      paragraphs: [
        "Mia 这个名称、版面和我们撰写的文字，在正式运营者确定后由其持有或获授权使用。卡组织的名称属于各自的权利人，本站用来描述卡种，不表示存在赞助或授权关系。",
      ],
    },
    {
      heading: "责任",
      paragraphs: [
        "在法律允许的范围内，本站对你因使用这些摘要而做的决定不承担责任。这句话没有排除法律不允许排除的责任。",
        "预期适用的法律是香港法律，争议的处理方式待法律顾问确认。在草案阶段，这不是一份已经谈妥司法管辖的正式合同。",
      ],
    },
    {
      heading: "修订",
      paragraphs: ["条款更新后会改草案日期，并在补上生效日期后才视为正式版本。继续使用更新后的网站，表示你阅读的是当时页面上的那一版。"],
    },
  ],
};

const affiliateHant: LegalDocument = {
  title: "聯盟披露",
  description: "Mia 聯盟披露草案：介紹費、不按佣金排序，以及 channel 與 post。",
  intro: "若我們日後從申請連結獲得介紹費，這頁說明那對你意味著什麼。現時那些連結還沒有填上。",
  sections: [
    {
      heading: "我們可能怎樣賺錢",
      paragraphs: [
        "Mia 計劃以聯盟模式運作。你經本站轉頁完成合資格申請後，合作方可能向 Mia 支付介紹費。",
        "介紹費不會改寫你在發行機構那裡看到的年費、回贈、迎新或利息。那些條款以該機構的文件為準。",
      ],
    },
    {
      heading: "現在還沒有可計費的連結",
      paragraphs: [
        "卡片矩陣的 apply_url 欄是空的。轉頁會停在本站，並寫明連結未啟用。",
        "所以這個預覽站目前沒有一條可以產生介紹費的申請連結。",
      ],
    },
    {
      heading: "預期的合作方",
      paragraphs: [
        "預期中的合作包括比較平台、券商與發卡銀行的聯盟計劃，例如 Creatory、Futu 這一類夥伴，以及銀行本身。",
        "這裡點名，是方便這些夥伴審閱本站的立場。它不表示合約已經簽署，也不表示本站載有它們任何現行優惠。",
      ],
    },
    {
      heading: "排序",
      paragraphs: [
        "比較表依照資料檔的次序顯示。我們不按介紹費高低重排，也不用評分標籤把某一張卡推到最前。",
        "這個承諾寫進頁面，是因為空白的表最容易在日後被悄悄改成佣金排序。資料檔的列序就是頁面上的列序。",
      ],
    },
    {
      heading: "channel 與 post",
      paragraphs: [
        "轉頁網址接受 channel 與 post 兩個參數，用來分辨來源。例如 channel=ig 表示 Instagram，channel=xhs 表示小紅書，channel=site 表示這個網站本身。post 是一則內容的代號，不是內文。",
        "這些參數會出現在本機紀錄與 affiliate_outbound 事件裡。它們不是你的姓名。",
      ],
    },
  ],
};

const affiliateHans: LegalDocument = {
  title: "联盟披露",
  description: "Mia 联盟披露草案：介绍费、不按佣金排序，以及 channel 与 post。",
  intro: "若我们日后从申请链接获得介绍费，这页说明那对你意味着什么。目前那些链接还没有填上。",
  sections: [
    {
      heading: "我们可能怎样赚钱",
      paragraphs: [
        "Mia 计划以联盟模式运作。你经本站跳转页完成合资格申请后，合作方可能向 Mia 支付介绍费。",
        "介绍费不会改写你在发卡机构那里看到的年费、回赠、迎新或利息。那些条款以该机构的文件为准。",
      ],
    },
    {
      heading: "现在还没有可计费的链接",
      paragraphs: [
        "卡片矩阵的 apply_url 栏是空的。跳转页会停在本站，并写明链接未启用。",
        "所以这个预览站目前没有一条可以产生介绍费的申请链接。",
      ],
    },
    {
      heading: "预期的合作方",
      paragraphs: [
        "预期中的合作包括比较平台、券商和发卡银行的联盟计划，例如 Creatory、Futu 这一类伙伴，以及银行本身。",
        "这里点名，是方便这些伙伴审阅本站的立场。它不表示合同已经签署，也不表示本站载有它们任何现行优惠。",
      ],
    },
    {
      heading: "排序",
      paragraphs: [
        "比较表依照数据文件的次序显示。我们不按介绍费高低重排，也不用评分标签把某一张卡推到最前。",
        "这个承诺写进页面，是因为空白的表最容易在日后被悄悄改成佣金排序。数据文件的行序就是页面上的行序。",
      ],
    },
    {
      heading: "channel 与 post",
      paragraphs: [
        "跳转页网址接受 channel 与 post 两个参数，用来分辨来源。例如 channel=ig 表示 Instagram，channel=xhs 表示小红书，channel=site 表示这个网站本身。post 是一则内容的代号，不是正文。",
        "这些参数会出现在本地记录与 affiliate_outbound 事件里。它们不是你的姓名。",
      ],
    },
  ],
};

const adviceHant: LegalDocument = {
  title: "不是財務意見",
  description: "Mia 提供一般資訊，不是按你的情況作出的財務意見或信貸承諾。",
  intro: "請把本站當成一張還沒有填數字的比較表和幾篇說明，而不是對你個人的建議。",
  sections: [
    {
      heading: "沒有按你的情況做建議",
      paragraphs: [
        "頁面上的分類、篩選與說明是一般資訊。它們沒有考慮你的收入、負債、逗留身份或還款能力。",
        "Mia 不是你的財務顧問，也不是發卡機構。我們沒有替你做負擔能力評估。",
      ],
    },
    {
      heading: "空白不是一項條件",
      paragraphs: [
        "待補表示我們還沒有寫入該項條款。不要把它讀成免年費、免利息或必定獲批。",
        "日後出現的摘要仍然不能取代發行機構的收費表、條款及細則與申請頁。",
      ],
    },
    {
      heading: "批核與回贈狀態",
      paragraphs: [
        "批核、信用額與迎新資格由發行機構決定。本站不預測結果。",
        "回贈進度頁顯示的是資料檔裡的狀態，不是銀行的入帳通知。示範紀錄沒有真實金額。",
      ],
    },
    {
      heading: "需要個別協助時",
      paragraphs: [
        "若你需要按個人情況做的意見，請諮詢你所信任的持牌人士。",
        "若還款出現壓力，請直接聯絡發卡機構，或尋求你所信任的輔導服務。本站不提供債務重整。",
      ],
    },
  ],
};

const adviceHans: LegalDocument = {
  title: "不是财务意见",
  description: "Mia 提供一般信息，不是按你的情况作出的财务意见或信贷承诺。",
  intro: "请把本站当成一张还没有填数字的比较表和几篇说明，而不是对你个人的建议。",
  sections: [
    {
      heading: "没有按你的情况做建议",
      paragraphs: [
        "页面上的分类、筛选和说明是一般信息。它们没有考虑你的收入、负债、逗留身份或还款能力。",
        "Mia 不是你的财务顾问，也不是发卡机构。我们没有替你做负担能力评估。",
      ],
    },
    {
      heading: "空白不是一项条件",
      paragraphs: [
        "待补表示我们还没有写入该项条款。不要把它读成免年费、免利息或必定获批。",
        "日后出现的摘要仍然不能取代发卡机构的收费表、条款及细则和申请页。",
      ],
    },
    {
      heading: "审批与回赠状态",
      paragraphs: [
        "审批、信用额和迎新资格由发卡机构决定。本站不预测结果。",
        "回赠进度页显示的是数据文件里的状态，不是银行的入账通知。示范记录没有真实金额。",
      ],
    },
    {
      heading: "需要个别协助时",
      paragraphs: [
        "若你需要按个人情况做的意见，请咨询你所信任的持牌人士。",
        "若还款出现压力，请直接联系发卡机构，或寻求你所信任的辅导服务。本站不提供债务重整。",
      ],
    },
  ],
};

export const legalDocs: Record<LegalSlug, Record<Lang, LegalDocument>> = {
  privacy: { "zh-hant": privacyHant, "zh-hans": privacyHans },
  terms: { "zh-hant": termsHant, "zh-hans": termsHans },
  "affiliate-disclosure": { "zh-hant": affiliateHant, "zh-hans": affiliateHans },
  "not-financial-advice": { "zh-hant": adviceHant, "zh-hans": adviceHans },
};
