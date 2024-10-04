// document.body.style.backgroundColor = 'purple';

fetch(`${window.location.href}&xml=T`)
  .then(response => response.text())
  .then(

    data => {
      
      let info = {
        lineas: []
      }
      
      // Crear un nuevo DOMParser
      const parser = new DOMParser();
      
      // Analizar el XML
      const xmlDoc = parser.parseFromString(data, "text/xml");
      
      // Extraer datos
      const lineasXML = xmlDoc.getElementsByTagName("line");

      info.workcalendarhours = xmlDoc.getElementsByTagName("workcalendarhours")?.[0]?.textContent;
      info.enddate = xmlDoc.getElementsByTagName("enddate")?.[0]?.textContent;
      info.hourstotal = xmlDoc.getElementsByTagName("hourstotal")?.[0]?.textContent;
      info.hourstotal1 = xmlDoc.getElementsByTagName("hourstotal1")?.[0]?.textContent;
      info.hourstotal2 = xmlDoc.getElementsByTagName("hourstotal2")?.[0]?.textContent;
      info.hourstotal3 = xmlDoc.getElementsByTagName("hourstotal3")?.[0]?.textContent;
      info.hourstotal4 = xmlDoc.getElementsByTagName("hourstotal4")?.[0]?.textContent;
      info.hourstotal5 = xmlDoc.getElementsByTagName("hourstotal5")?.[0]?.textContent;
      info.hourstotal6 = xmlDoc.getElementsByTagName("hourstotal6")?.[0]?.textContent;
      info.hourstotal7 = xmlDoc.getElementsByTagName("hourstotal7")?.[0]?.textContent;
      info.id = xmlDoc.getElementsByTagName("id")?.[0]?.textContent;
      info.startdate = xmlDoc.getElementsByTagName("startdate")?.[0]?.textContent;
      info.type = xmlDoc.getElementsByTagName("type")?.[0]?.textContent;
      
      for (let i = 0; i < lineasXML.length; i++) {
        const linea = lineasXML[i];

        info.lineas.push({
          casetaskevent: linea.getElementsByTagName('casetaskevent')?.[0]?.textContent,
          casetaskevent_display: linea.getElementsByTagName('casetaskevent_display')?.[0]?.textContent,
          customer: linea.getElementsByTagName('customer')?.[0]?.textContent,
          customer_display: linea.getElementsByTagName('customer_display')?.[0]?.textContent,
          hours1: linea.getElementsByTagName('hours1')?.[0]?.textContent,
          hours2: linea.getElementsByTagName('hours2')?.[0]?.textContent,
          hours3: linea.getElementsByTagName('hours3')?.[0]?.textContent,
          hours4: linea.getElementsByTagName('hours4')?.[0]?.textContent,
          hours5: linea.getElementsByTagName('hours5')?.[0]?.textContent,
          hours6: linea.getElementsByTagName('hours6')?.[0]?.textContent,
          hours7: linea.getElementsByTagName('hours7')?.[0]?.textContent,
          hourstotal: linea.getElementsByTagName('hourstotal')?.[0]?.textContent,
          memo1: linea.getElementsByTagName('memo1')?.[0]?.textContent,
          memo2: linea.getElementsByTagName('memo2')?.[0]?.textContent,
          memo3: linea.getElementsByTagName('memo3')?.[0]?.textContent,
          memo4: linea.getElementsByTagName('memo4')?.[0]?.textContent,
          memo5: linea.getElementsByTagName('memo5')?.[0]?.textContent,
          memo6: linea.getElementsByTagName('memo6')?.[0]?.textContent,
          memo7: linea.getElementsByTagName('memo7')?.[0]?.textContent,
          id: linea.getElementsByTagName('id')?.[0]?.textContent,
        });
      }

      // console.log({ info });
      chrome.runtime.sendMessage(info);
    }
  )
  .catch(error => console.error('Error:', error));