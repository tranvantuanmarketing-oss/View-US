import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const out='/Users/tony/Downloads/View US/outputs/01a16905';
const rows=[
['Histoires de vie',35000,'Pháp','Video 15–30 giây','Gia đình · âm mưu hại người thân; Cha mẹ ruột · thiên vị','Ưu tiên: hook âm mưu, lật mặt. Bình luận chủ yếu xin phần tiếp.','61591503404425','Người giúp việc cảnh báo doanh nhân bị gia đình đầu độc',6800,334,24,'Đã mở bình luận: nhiều “oui”, “la suite”; page kêu gọi trả lời để đọc tiếp. Like riêng khoảng 6.700.','https://www.facebook.com/reel/1788792885787811/'],
['Revenge Stories',25000,'Anh','Video kể chuyện 28–32 phút','Con riêng · mẹ kế / cha dượng; Bí mật gia đình · quá khứ','Ưu tiên: truyện dài có phản hồi về nhân vật.','61589408379914','Con dâu để lại đứa trẻ câm; sau đó đứa trẻ lên tiếng',1100,51,34,'Có người đồng cảm với Bennett và phản hồi về câu chuyện.',''],
['Revenge Stories',124000,'Anh','Video khoảng 30 giây','Thân phận giấu kín · nghề nghiệp bí mật','Ưu tiên: quân nhân bị coi thường rồi lộ thân phận.','61593330323271','Cha gọi con gái là kẻ thất bại tại tiệc nghỉ hưu',6000,29,23,'Tương tác mạnh ở mẫu này; chưa kiểm tra sâu nội dung bình luận.',''],
['Histoires de Vie',72000,'Pháp','Video 15–16 giây','Thừa kế · di chúc; Bí mật gia đình · quá khứ','Tham khảo cách cắt ở nút thắt và vật chứng.','61595298353640','Đầu bếp bị chủ nhà hàng truy tìm sau khi nếm món ăn',507,9,1,'Mẫu di chúc khác: 209 cảm xúc / 9 bình luận / 1 chia sẻ.',''],
['Family Life Stories',85000,'Anh','Video khoảng 30 giây','Hôn nhân · sỉ nhục; Bạo hành · chồng vũ phu','Hook xung đột rõ; bình luận còn ít trong mẫu.','61593398000918','Chồng tát vợ trước mặt người phụ nữ khác',115,1,3,'Các mẫu khác: 10 và 65 cảm xúc.',''],
['Family Stories',61000,'Anh','Video khoảng 30 giây','Nhà chồng · nhà vợ; Hôn nhân · sỉ nhục','Tham khảo mâu thuẫn gia đình trong bữa ăn, sân bay.','61593035590379','Đĩa ăn bị đặt gần sàn trong bữa tối Giáng sinh',44,3,null,'Mẫu khác: 4 và 23 cảm xúc; chưa đọc sâu bình luận.',''],
['Family Stories',21000,'Anh','Ảnh + bài viết','Con cái · lợi dụng cha mẹ; Cha mẹ già · bỏ rơi','Sát dạng bài viết; bình luận cao hơn cảm xúc ở vài mẫu.','61589900340340','Bài về cha mẹ bị gia đình lợi dụng hoặc bỏ rơi',8,28,null,'Mẫu khác: 2 cảm xúc / 16 bình luận. Chưa đối chiếu sâu chất lượng bình luận.',''],
['Life stories',89000,'Anh','Video 10 giây + chữ/ảnh AI','Thân phận giấu kín · nghề nghiệp bí mật; Gia đình ruột · bị coi thường','Tham khảo thân phận quân nhân bị gia đình đánh giá thấp.','61588505528357','Cha gọi con gái là tiếp viên; sĩ quan xuất hiện',12,10,null,'Mẫu khác: 4/4 và 5/7 (cảm xúc/bình luận).',''],
['Revenge Stories',31000,'Tây Ban Nha','Video khoảng 30 giây','Thân phận ẩn · lật mặt; Nhà chồng · nhà vợ','Tương tác mẫu thấp; chỉ tham khảo cách triển khai.','61590571054545','Bị coi thường ở cửa hàng; chồng cũ lộ thân phận',null,null,null,'Các mẫu ghi nhận 2–6 cảm xúc và 2–3 bình luận; không ghép thành một bài.',''],
['Family Drama',163000,'Anh','Truyện AI nhiều tập','Thừa kế · di chúc; Nhà chồng · nhà vợ','Chủ đề sát nhu cầu nhưng mẫu chưa cho thấy tương tác mạnh.','JoyAmakaCarino','Mẹ chồng chuyển đến sống cùng mà không hỏi ý',22,null,null,'Mẫu The Will: 3 cảm xúc; bài giới thiệu: 2 cảm xúc / 1 bình luận.',''],
['Story Time With Ginika',120000,'Anh','Series truyện AI','Chưa đủ nội dung để chốt nhãn trong ảnh','Tham khảo nhịp đăng và series Firstborn Daughter.','61590849145055','Firstborn Daughter — tập 3',544,45,10,'Khoảng 17 giờ tuổi; tập 4: 175/18/5; tập 2: 346/27/6. Chưa xem trọn tập.',''],
['Story time with Mercy',366000,'Anh','Series drama gia đình AI','Chưa đủ nội dung để chốt nhãn trong ảnh','Tham khảo kể chuyện nhiều tập và bài học gia đình.','61578456759211','Một tập truyện trong feed đã kiểm tra',206,4,null,'Mẫu khác: 83/4 và 152/9/1. Cần xem sâu để phân loại chính xác.',''],
['story time with nnenne',807000,'Anh','Truyện AI nhiều tập','Bí mật gia đình · quá khứ','Tham khảo tiêu đề bí mật quan hệ và huyết thống.','storytimewithnnenne1','Two Brothers Married The Same Woman',80,3,null,'Khoảng 3 ngày tuổi; I’m Not My Mother’s Child: 28 cảm xúc / 8 bình luận.',''],
['Life Stories',1600000,'Anh','Bài viết kể chuyện + ảnh AI','Lòng tốt người lạ · ân nhân bất ngờ; Cha mẹ già · bỏ rơi','Follower lớn nhưng tương tác mẫu thấp.','61582198786094','Chiếc khăn bà chưa đan xong',11,9,null,'Feed hiển thị bài ngày 18/9, khoảng 5 tuần trước lúc xem; mẫu khác 10/2.',''],
['AmoMama France',5700000,'Pháp','Ảnh + bài viết, xen tin người nổi tiếng','Bí mật gia đình · quá khứ; Vợ chồng · bí mật lừa dối','Ưu tiên học cách viết hook ảnh + truyện.','AmoMama.France','Mẹ về sau một tháng nằm viện; con gái cảnh báo',36,1,null,'Bài khoảng 1 giờ tuổi. Mẫu khác còn mới nên chưa kết luận hiệu quả.',''],
['AmoMama Famille',1700000,'Pháp','Ảnh + truyện gia đình','Nhà chồng · nhà vợ; Bí mật gia đình · quá khứ','Ưu tiên mẫu bài ảnh và xung đột gia đình.','AmoMama.Famille','Nhà chồng chiếm sân sau để tổ chức BBQ',8,2,null,'Khoảng 3 giờ tuổi; mẹ làm hộ sinh 40 năm có bí mật: 4/2.',''],
['AmoMama Familia',9100000,'Tây Ban Nha','Ảnh + truyện, xen tin người nổi tiếng','Con riêng · mẹ kế; Lòng tốt người lạ · ân nhân bất ngờ','Tham khảo bản địa hóa và mô-típ ân nhân.','AmoMama.Familia','Cho đứa trẻ hàng xóm ăn; 20 năm sau quay lại',11,2,null,'Khoảng 1 giờ tuổi; mẹ kế chê váy tốt nghiệp: 2/1 sau 13 phút.',''],
['AmoMama.com',16000000,'Anh','Ảnh + truyện, xen tin người nổi tiếng','Lòng tốt người lạ · ân nhân bất ngờ','Quy mô lớn; cần lọc truyện khỏi tin người nổi tiếng.','100064392864209','Giúp người hàng xóm 79 tuổi trả hóa đơn',15,2,null,'Bài khoảng 2 giờ tuổi; chưa đại diện hiệu quả toàn page.',''],
['AmoMama Deutschland',1600000,'Đức','Ảnh + truyện dịch/bản địa hóa','Bí mật gia đình · quá khứ; Vợ chồng · bí mật lừa dối','Nhiều mô-típ trùng bản Pháp; hữu ích để đối chiếu bản dịch.','AmoMama.Deutschland','Mẹ về sau thời gian nằm viện; con cảnh báo',25,1,null,'Các mẫu trong khoảng 13 phút–3 giờ tuổi, còn quá mới để so hiệu quả.',''],
['AmoMama UK',1200000,'Anh','Bài ảnh, truyện và tin người nổi tiếng','Chưa đủ nội dung để chốt nhãn trong ảnh','Ưu tiên thấp hơn vì feed pha nhiều nội dung.','AmoMama.UK','Người phụ nữ tranh cãi về xe đẩy ở siêu thị',2,1,1,'Bài khoảng 50 phút tuổi; chưa đọc sâu bình luận.','']
];
const url=k=>/^\d+$/.test(k)?`https://www.facebook.com/profile.php?id=${k}`:`https://www.facebook.com/${k}`;
const wb=Workbook.create();
function sheet(name,title,notes,headers,data,widths){
 const s=wb.worksheets.add(name); s.showGridLines=false;
 s.getRange('A2').values=[[title]]; s.getRange('A2').format.font={size:16,bold:true};
 notes.forEach((t,i)=>s.getCell(i+3,0).values=[[t]]);
 const start=notes.length+5; const end=start+data.length; const last=String.fromCharCode(64+headers.length);
 s.getRange(`A${start}:${last}${end}`).values=[headers,...data];
 s.getRange(`A1:${last}${end}`).format.font.name='Arial'; s.getRange(`A${start}:${last}${end}`).format.font.size=11;
 s.getRange(`A${start}:${last}${end}`).format.wrapText=true;
 s.getRange(`A${start}:${last}${end}`).format.verticalAlignment='center';
 s.getRange(`A${start}:${last}${start}`).format={fill:'#203F60',font:{color:'#FFFFFF',bold:true},rowHeight:36};
 s.getRange(`A${start+1}:${last}${end}`).format.rowHeight=84;
 for(let i=0;i<widths.length;i++)s.getRangeByIndexes(start-1,i,data.length+1,1).format.columnWidth=widths[i];
 for(let r=start+1;r<=end;r+=2)s.getRange(`A${r}:${last}${r}`).format.fill='#F1F5F9';
 s.freezePanes.freezeRows(start); s.freezePanes.freezeColumns(2);
 return {s,start,end};
}
const p=sheet('20 page tham khảo','20 PAGE DRAMA GIA ĐÌNH',[
'Khảo sát 23/10/2026 • Chọn 20 trong 29 ứng viên • Thứ tự tham khảo, không phải bảng xếp hạng viral.',
'Follower là số làm tròn hiển thị. Chỉ khảo sát một số bài; 6 page AmoMama thuộc cùng thương hiệu.',
'Ưu tiên: Histoires de vie 35K, Revenge Stories 25K/124K, AmoMama France và AmoMama Famille.'
],['STT','Page','Follower ≈','Ngôn ngữ','Dạng nội dung','Chủ đề theo ảnh','Nhận xét / cách dùng','Link page'],rows.map((r,i)=>[i+1,...r.slice(0,6),url(r[6])]),[7,29,15,16,28,43,51,65]);
p.s.getRange(`C${p.start+1}:C${p.end}`).setNumberFormat('#,##0');
const q=sheet('Mẫu tương tác','MẪU BÀI VÀ BÌNH LUẬN',[
'Cảm xúc = tổng reactions, không đồng nghĩa Like riêng. Số dạng K được quy đổi xấp xỉ.',
'Ô trống = chưa ghi nhận, không phải 0. Số liệu thuộc một mẫu/bài, không phải tổng của page.',
'Bình luận có thể gồm trả lời, bình luận page và xin phần tiếp. Các bài có tuổi khác nhau không so trực tiếp.'
],['STT','Page','Nội dung mẫu','Cảm xúc ≈','Bình luận','Chia sẻ','Kiểm tra / giới hạn','Nguồn'],rows.map((r,i)=>[i+1,r[0],r[7],r[8],r[9],r[10],r[11],r[12]||url(r[6])]),[7,29,48,15,15,15,66,68]);
q.s.getRange(`D${q.start+1}:F${q.end}`).setNumberFormat('#,##0');
wb.recalculate();
console.log((await wb.inspect({kind:'table',range:`'20 page tham khảo'!A${p.start}:D${p.end}`,tableMaxRows:22,tableMaxCols:4,maxChars:4000})).ndjson);
for(const [n,r] of [['20 page tham khảo','A8:G12'],['Mẫu tương tác','A8:G12']]){
 const b=await wb.render({sheetName:n,range:r,scale:1,format:'png'}); await fs.writeFile(`${out}/research-build/${n}.png`,new Uint8Array(await b.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(`${out}/20-page-drama.xlsx`);
console.log('Saved 20 pages and 20 sample rows');
