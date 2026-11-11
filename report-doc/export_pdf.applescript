-- ใช้: osascript export_pdf.applescript <docx> update      (อัปเดตสารบัญ/เลขหน้า แล้วบันทึก)
--      osascript export_pdf.applescript <docx> <pdf path>   (export PDF อย่างเดียว)
on run argv
	set inPath to POSIX file (item 1 of argv)
	set outPath to (item 2 of argv)
	with timeout of 600 seconds
		tell application "Microsoft Word"
			activate
			open inPath
			set d to active document
			if outPath is "update" then
				-- อัปเดตเฉพาะสารบัญทั้ง 3 (สารบัญ, รูปภาพ, ตาราง) ไม่ไล่ทุก field เพราะอัปเดตสารบัญแล้วมี PAGEREF เพิ่ม เลข field เลื่อนจนสารบัญตารางหลุดรอบ
				repeat 2 times
					repeat with i from 1 to (count of tables of contents of d)
						update (table of contents i of d)
					end repeat
				end repeat
				save d
			else
				save as d file name outPath file format format PDF
			end if
			close d saving no
		end tell
	end timeout
end run
