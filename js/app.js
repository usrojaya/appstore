
const targetJavaScript = ` 

                      
     const matahari = document.getElementById('matahari');
     const bumi = document.getElementById('bumi');
     let sudut = 0;
     
      function planet() {
const matahariX = matahari.offsetLeft + matahari.offsetWidth / 2;
const matahariY = matahari.offsetTop + matahari.offsetHeight / 2; 
const jarak_Bumi = 100; 
const bumiX = matahariX + jarak_Bumi * Math.cos(sudut);
const bumiY = matahariY + jarak_Bumi * Math.sin(sudut);

bumi.style.left = bumiX - bumi.offsetWidth / 2 +'px';
bumi.style.top = bumiY - bumi.offsetHeight / 2 +'px';
            sudut += 0.01;
            requestAnimationFrame(planet);
        }

          planet(); 
          `;


const app = document.getElementById("code");
  const typewriter = new Typewriter(app, {
  loop: false,
  delay: 25
});  




function typeWriter() {
  
  typeJavaScript();
 
}

document.querySelector("#run").addEventListener("click", typeWriter);



function typeJavaScript() {

const highlightedText = Prism.highlight(targetJavaScript, Prism.languages.typescript);
typewriter.typeString(highlightedText).start();

}

 