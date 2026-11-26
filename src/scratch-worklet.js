// Continuous vinyl-style scrub renderer. No DOM or animation loop.
class GoldenStealScratchProcessor extends AudioWorkletProcessor {
  constructor(){
    super();this.pcm=null;this.rate=22050;this.pos=0;this.target=0;this.velocity=0;this.gain=0;this.active=false;
    this.port.onmessage=({data:m})=>{
      if(m.type==='buffer'){this.pcm=m.pcm;this.rate=m.rate;this.active=false;this.gain=0;this.velocity=0;}
      if(m.type==='start'){this.pos=this.target=m.position*this.rate;this.velocity=0;this.gain=0;this.active=true;}
      if(m.type==='move')this.target=m.position*this.rate;
      if(m.type==='stop')this.active=false;
    };
  }
  process(inputs,outputs){
    const out=outputs[0][0];if(!out)return true;
    if(!this.pcm){out.fill(0);return true;}
    const scale=this.rate/sampleRate, max=2.2*scale, smooth=1-Math.exp(-1/(sampleRate*.008)), fade=1-Math.exp(-1/(sampleRate*.004));
    for(let i=0;i<out.length;i++){
      const error=this.target-this.pos;
      const desired=this.active?Math.max(-max,Math.min(max,error/(sampleRate*.023))):0;
      this.velocity+=(desired-this.velocity)*smooth;
      const audible=this.active&&Math.abs(error)>1&&Math.abs(this.velocity)>.004?1:0;
      this.gain+=(audible-this.gain)*fade;
      const j=Math.floor(this.pos),frac=this.pos-j;
      const x=j>=0&&j+1<this.pcm.length?this.pcm[j]*(1-frac)+this.pcm[j+1]*frac:0;
      out[i]=x*this.gain*.85;
      this.pos=Math.max(0,Math.min(this.pcm.length-1,this.pos+this.velocity));
    }
    return true;
  }
}
registerProcessor('goldensteal-scratch',GoldenStealScratchProcessor);
