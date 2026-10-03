$o="D:\projects\portfolio\other websites demo\nuance-react\sales-kit-v2\out"
$pp=New-Object -ComObject PowerPoint.Application
foreach($n in "DWD_Salon_Sales_Deck_v2","DWD_Salon_MASTER_Editable"){
  $d=$pp.Presentations.Open("$o\$n.pptx",$true,$false,$false)
  $d.SaveAs("$o\$n.pdf",32)
  if($n -eq "DWD_Salon_MASTER_Editable"){ for($i=1;$i -le $d.Slides.Count;$i++){$d.Slides.Item($i).Export("$o\_m_$i.png","PNG",800,450)} }
  $d.Close()
}
$pp.Quit()
