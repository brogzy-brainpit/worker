const check= function(style,title){
    if(title=="text" || title=="paragraph" || title=="html" || title=="link"){
       return {color:style.color,display:"block",
       width:style.width,fontFamily:style.fontFamily,background:style.backgroundColor,textDecoration:style.textDecoration,
     fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,"mso-line-height-rule":"exactly",lineHeight:`${style.lineHeight}px`,
     borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
       fontSize:`${style.fontSize}px`,textTransform:style.textTransform,backgroundColor:style.backgroundColor,
       textAlign:style.textAlign,padding:`${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`}
   }
   if(title=="ind-text"){
     return {color:style.color,display:"block",
   fontFamily:style.fontFamily,background:style.backgroundColor,
   fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,"mso-line-height-rule":"exactly",lineHeight:`${style.lineHeight}px`,
   borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
   borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     fontSize:`${style.fontSize}px`,textTransform:style.textTransform,backgroundColor:style.backgroundColor,
     textAlign:style.textAlign,padding:`${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`}
   }
   if(title=="normal-text"){
     return {color:style.color,display:"block",
   fontFamily:style.fontFamily,background:style.backgroundColor,
   fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,"mso-line-height-rule":"exactly",lineHeight:`${style.lineHeight}px`,
   borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,paddingTop:`${style.paddingTop}px`,paddingBottom:`${style.paddingBottom}px`,
   paddingLeft:`${style.paddingLeft}px`,paddingRight:`${style.paddingRight}px`,
   borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     fontSize:`${style.fontSize}px`,textTransform:style.textTransform,backgroundColor:style.backgroundColor,
     textAlign:style.textAlign}
   }
   if(title=="text-td"){
     return {color:style.color,
     border:style.borderWidth>0?`${style.borderStyle} ${style.borderWidth}px borderColor:style.borderColor `:"none",Minheight:"8px",
     width:style.width,fontFamily:style.fontFamily,background:style.backgroundColor,"mso-para-margin":`${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`,
   fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,"mso-line-height-rule":"exactly",lineHeight:`${style.lineHeight}px`,
   borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
   borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     fontSize:`${style.fontSize}px`,textTransform:style.textTransform,backgroundColor:style.backgroundColor,
     textAlign:style.textAlign,padding:`${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`,"mso-padding-top-alt":`${style.paddingTop}px`,"mso-padding-bottom-alt":`${style.paddingBottom}px`,"mso-padding-left-alt":`${style.paddingLeft}px`,"mso-padding-right-alt":`${style.paddingRight}px`}
   }  
   if(title=="col-container"){
     return {width:style.width,border:style.borderWidth>0?`${style.borderStyle} ${style.borderWidth}px ${style.borderColor}`:"none",
          paddingTop:`${style.paddingTop}px`,paddingBottom:`${style.paddingBottom}px`,
              paddingLeft:`${style.paddingLeft}px`,paddingRight:`${style.paddingRight}px`,backgroundImage:style.backgroundImage?`url(${style.backgroundImage})`:"",backgroundRepeat:style.backgroundImage?`no-repeat`:"",backgroundPosition:style.backgroundImage?`center center`:"",
              backgroundSize:style.backgroundImage?`cover`:"",background:style.backgroundColor,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,}
            }
            if(title=="col2-container"){
             return {verticalAlign:style.verticalAlignment,width:style.width,border:style.borderWidth>0?`${style.borderStyle} ${style.borderWidth}px ${style.borderColor}`:"none",
                  paddingTop:`${style.paddingTop}px`,paddingBottom:`${style.paddingBottom}px`,
                      paddingLeft:`${style.paddingLeft}px`,paddingRight:`${style.paddingRight}px`,backgroundImage:style.backgroundImage?`url(${style.backgroundImage})`:"",backgroundRepeat:style.backgroundImage?`no-repeat`:"",backgroundPosition:style.backgroundImage?`top center`:"",
                      backgroundSize:style.backgroundImage?`cover`:"",background:style.backgroundColor,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,}
                    }
                    if(title=="col3-container"){
                     return {verticalAlign:style.verticalAlignment,width:style.width,border:style.borderWidth>0?`${style.borderStyle} ${style.borderWidth}px ${style.borderColor}`:"none",
                          paddingTop:`${style.paddingTop}px`,paddingBottom:`${style.paddingBottom}px`,
                              paddingLeft:`${style.paddingLeft}px`,paddingRight:`${style.paddingRight}px`,backgroundImage:style.backgroundImage?`url(${style.backgroundImage})`:"",backgroundRepeat:style.backgroundImage?`no-repeat`:"",backgroundPosition:style.backgroundImage?`top center`:"",
                              backgroundSize:style.backgroundImage?`cover`:"",t:`${style.paddingRight}px`,backgroundImage:style.backgroundImage?`url(${style.backgroundImage})`:"",backgroundRepeat:style.backgroundImage?`no-repeat`:"",backgroundPosition:style.backgroundImage?`top center`:"",
                      backgroundSize:style.backgroundImage?`cover`:"",background:style.backgroundColor,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,}
                            }
         if(title=="row-container"){
           return {width:style.width,margin:style.containerAlignment=="center"?`${style.marginTop}px auto ${style.marginBottom}px auto`:style.containerAlignment=="right"?
             `${style.marginTop}px ${style.marginLeft}px ${style.marginBottom}px auto`:`${style.marginTop}px auto ${style.marginBottom}px ${style.marginRight}px`,borderRadius:`${style.borderRadius}px`,
             minHeight:`${50}px`,height:`${style.height}px`,maxHeight:`${style.height}px`,paddingTop:`${style.paddingTop}px`,paddingBottom:`${style.paddingBottom}px`,
             paddingLeft:`${style.paddingLeft}px`,paddingRight:`${style.paddingRight}px`,marginTop:`${style.marginTop}px`,marginBottom:`${style.marginBottom}px`,
             marginLeft:`${style.marginLeft}px`,marginRight:`${style.marginRight}px`,backgroundColor:style.backgroundColor,backgroundImage:style.backgroundImage?`url(${style.backgroundImage})`:"",backgroundRepeat:style.backgroundImage?`no-repeat`:"",backgroundSize:"cover",backgroundPosition:style.backgroundImage?`center center`:"",
             backgroundSize:style.backgroundImage?`cover`:"",borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,"mso-para-margin":"10px",background:style.backgroundColor,}
           }
   if(title=="image"){
     return {
     width:"100%",maxWidth:"100%",borderRadius:`${style.borderRadius}${style.val}`}
   }
   if(title=="col-image"){
     return {
     width:"100%",maxWidth:"100%",borderRadius:`${style.borderRadius}${style.val}`}
   }
   if(title=="row-image"){
     return {
     width:style.width,maxWidth:"100%",borderRadius:`${style.borderRadius}${style.val}`,margin:`${style.marginTop}px`}
   }
   if(title=="hr"){
     return{borderWidth:"0px",textAlign:"center",borderColor:"transparent",height:`${style.height}px`,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,
     borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,margin:style.imageAlignment=="center"?"auto":style.imageAlignment=="right"?
     `0px ${style.marginRight ||0}px 0px auto`:`0px auto 0px ${style.marginRight ||0}px`,marginTop:`${style.marginTop}px`,marginBottom:`${style.marginBottom}px`}                       
   }
   if(title=="hr-row"){
     return{height:`${style.height}px`,borderWidth:"0px",textAlign:"center",borderColor:"transparent",height:`${0}px`,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,
     borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`}
   }
   if(title=="hr-col"){
     return{height:`${style.height}px`,borderWidth:"0px",textAlign:"center",borderColor:"transparent",height:`${0}px`,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,
     borderTopRightRadius:`${style.borderTopRightRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`}
   }
   
   
   else if(title=="button"){
     return {boxSizing:"border-box",border:style.borderWidth>0?`${style.borderStyle} ${style.borderWidth}px ${style.borderColor}`:"none",textAlign:"center",
     fontSize:`${style.fontSize}px`,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
     background:style.backgroundColor,color:style.color,fontFamily:style.fontFamily,"mso-line-height-rule":"exactly",lineHeight:"16px",
     textTransform:style.textTransform,width:"100%",display:"block",padding:`${style.paddingVert}px`,
     fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,marginTop:`${style.marginTop}px`,marginBottom:`${style.marginBottom}px`,marginRight:`${style.marginRight}px`,marginLeft:`${style.marginLeft}px`}
     // textAlign:style.textAlign,textAlign:"center",fontSize:`${style.fontSize}px,marginBottom:`${style.marginBottom}px`,padding:`${style.paddingVert}px  ${style.paddingHorz}px`,minWidth:"fit-content"}}
   }
   }
   const containerChildStyle= function(style,title){
     if(title=="text" || title=="paragraph" || title=="html" || title=="link"){
       return {boxSizing:"border-box",color:style.color,
       fontFamily:style.fontFamily,background:style.backgroundColor,textDecoration:style.textDecoration,
     fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,"mso-line-height-rule":"exactly",lineHeight:`${style.lineHeight}px`,
     borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
     borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
       fontSize:`${style.fontSize}px`,textTransform:style.textTransform,backgroundColor:style.backgroundColor,
       textAlign:style.textAlign,padding:`${style.paddingTop}px ${style.paddingRight}px ${style.paddingBottom}px ${style.paddingLeft}px`
   }
   }
   if(title=="image"){
     return {margin:style.imageAlignment=="center"?"auto":style.imageAlignment=="right"?
     `0px ${style.marginRight ||0}px 0px auto`:`0px auto 0px ${style.marginRight ||0}px`,marginTop:`${style.marginTop}px`,marginBottom:`${style.marginBottom}px`,
     width:"100%",maxWidth:"100%",borderRadius:`${style.borderRadius}${style.val}`}
   } else if(title=="button"){
       return {boxSizing:"border-box",borderStyle:`${style.borderStyle}`,borderWidth:`${style.borderWidth}px`,borderColor:style.borderColor,textAlign:"center",
       fontSize:`${style.fontSize}px`,borderTopLeftRadius:`${style.borderTopLeftRadius}px`,borderTopRightRadius:`${style.borderTopRightRadius}px`,
       borderBottomLeftRadius:`${style.borderBottomLeftRadius}px`,borderBottomRightRadius:`${style.borderBottomRightRadius}px`,
       backgroundColor:style.backgroundColor,color:style.color,fontFamily:style.fontFamily,
       textTransform:style.textTransform,width:"100%",
       fontWeight:style.fontWeight,letterSpacing:`${style.letterSpacing}px`,margin:"auto !important",margin:style.imageAlignment=="center"?"auto":style.imageAlignment=="right"?
       `0px ${style.marginRight ||0}px 0px auto`:`0px auto 0px ${style.marginRight ||0}px`,marginTop:`${style.marginTop}px`,marginBottom:`${style.marginBottom}px`}
       // textAlign:style.textAlign,textAlign:"center",fontSize:`${style.fontSize}px,marginBottom:`${style.marginBottom}px`,padding:`${style.paddingVert}px  ${style.paddingHorz}px`,minWidth:"fit-content"}}
     }
   }

   function btnToPerc(width){
     return`${width.split("px")[0]}`
   
   }
   function calcBtn(width){
     const value= width.split("%")[0] 
     return`${(value/100)*650}px`
   
   }

  function calcRowBtn(width,parentWidth){
     if(parentWidth.includes("%")){
     let parent;
       const parentValue= parentWidth.split("%")[0] 
       parent= `${(parentValue/100)*650}`
   
       const value= width.split("%")[0] 
       return`${(value/100)*parent}px`
   
     }
     // else{
       // const parentValue= parentWidth.split("%")[0] 
   
       // const value= width.split("%")[0] 
       // return`${(value/100)*parentValue}px`
     // }
    
   
   }
   function calcBtnPerc(width){
     const value= width.split("px")[0] 
      return`${(value/650)*100}%`
    
    }
   
    function imagify(width){
     if(width.includes("px")){
     
       const parentValue= width.split("px")[0] 
       return parentValue
   
     }else{
       return width
     }
   
   }
   
    //  export {check,containerChildStyle}
 module.exports = {check,imagify,calcBtn,calcBtnPerc,calcRowBtn,containerChildStyle,btnToPerc};

