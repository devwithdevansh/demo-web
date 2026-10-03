"""Rebuild every document from data/pricing.json and build/content.py.   Run:  python build/build_all.py
Needs Microsoft Edge (PDF rendering) and PowerPoint (PPTX -> PDF export)."""
import pathlib, subprocess
import screens, brochure, playbook, outreach, clientdocs, calc, deck, master_pptx, master_docx, package

for m in (screens, brochure, playbook, outreach, clientdocs, calc, deck, master_pptx, master_docx):
    m.build(); print("built", m.__name__)
subprocess.run(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(pathlib.Path(__file__).with_name("export_pptx.ps1"))], check=True)
package.build()
