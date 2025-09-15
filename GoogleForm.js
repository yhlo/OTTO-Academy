
// 表單結果分類與寄信
// 表單(form)欄位調整需調整相關變數
// 2024.08.01 edited by LO

function myFunction(表單提交) {
    let 試算表 = 表單提交.source;
    let 工作表 = 試算表.getSheetByName("表單回應 1");
    let 最後一行 = 工作表.getLastRow();
  
    let 姓名 = 工作表.getRange(最後一行, 2).getValue();
    let 電話 = 工作表.getRange(最後一行, 3).getValue();
    let 信箱 = 工作表.getRange(最後一行, 4).getValue();
    let 年級 = 工作表.getRange(最後一行, 5).getValue();
    let 科目 = 工作表.getRange(最後一行, 6).getValue();
  
    let 週一時段 = 工作表.getRange(最後一行, 7).getValue();
    let 週二時段 = 工作表.getRange(最後一行, 9).getValue();
    let 週三時段 = 工作表.getRange(最後一行, 10).getValue();
    let 週四時段 = 工作表.getRange(最後一行, 11).getValue();
    let 週五時段 = 工作表.getRange(最後一行, 12).getValue();
    let 週六時段 = 工作表.getRange(最後一行, 13).getValue();
    let 週日時段 = 工作表.getRange(最後一行, 14).getValue();
  
    let 形式 = 工作表.getRange(最後一行, 15).getValue();
    let 地點 = 工作表.getRange(最後一行, 16).getValue();
    let 名稱 = 工作表.getRange(最後一行, 17).getValue();
    let 需求 = 工作表.getRange(最後一行, 8).getValue();
    // console.log(姓名,電話,信箱,年級,科目);
  
    let 課程工作表 = 試算表.getSheetByName(科目);
    if (課程工作表){ 
      課程工作表.appendRow([姓名,電話,信箱,名稱,年級,形式,地點,週一時段,週二時段,週三時段,週四時段,週五時段,週六時段,週日時段,需求]);
    } else {
      課程工作表 = 試算表.insertSheet(科目); //創建科目分頁
      課程工作表.appendRow(["姓名","電話","信箱","名稱","年級","形式","地點","週一時段","週二時段","週三時段","週四時段","週五時段","週六時段","週日時段","其他需求"]);
      課程工作表.appendRow([姓名,電話,信箱,名稱,年級,形式,地點,週一時段,週二時段,週三時段,週四時段,週五時段,週六時段,週日時段,需求]);
    }
    
    let 通知信件 = DocumentApp.openById("1ZDP8tTBIUqkjBd-Ocx1JSO8zXUx_IVT9sqx70yKWJzw");    // ---文件位置調整---
    let 信件內容 = 通知信件.getBody().getText();
    let 問候 = 姓名 + " 您好：\n\n" + 信件內容;
    GmailApp.sendEmail(信箱, "茲收到您填寫 OTTO Academy 報名表單", 問候);
  }