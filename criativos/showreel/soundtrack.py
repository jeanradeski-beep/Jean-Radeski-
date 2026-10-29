import numpy as np, wave
SR=44100; D=15.0; N=int(SR*D); t=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N); rng=np.random.default_rng(3)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*(1-max(0,pan)); R[i:j]+=s*(1+min(0,pan))
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def lp(x,a):  # one-pole lowpass, a may be array
    y=np.zeros_like(x); s=0.0; a=np.broadcast_to(a,x.shape)
    for k in range(len(x)): s+=a[k]*(x[k]-s); y[k]=s
    return y
def kick():
    n=int(.45*SR); x=np.arange(n)/SR; f=45+110*np.exp(-x*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-x*7)+ .3*np.sin(ph)*np.exp(-x*40)
def clap():
    n=int(.3*SR); x=np.arange(n)/SR; nz=rng.standard_normal(n)
    e=np.exp(-x*22)+.6*np.exp(-np.maximum(0,x-.012)*30)*(x>.012)+.4*np.exp(-np.maximum(0,x-.024)*30)*(x>.024)
    return (nz-lp(nz,.25))*e*.5
def hat(o=False):
    n=int((.25 if o else .06)*SR); nz=rng.standard_normal(n); hp=nz-lp(nz,.6)
    return hp*np.exp(-np.arange(n)/SR*(9 if o else 60))*.35
def impact():
    n=int(1.2*SR); x=np.arange(n)/SR; f=30+70*np.exp(-x*6); s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*2.5)
    nz=rng.standard_normal(n); s+=lp(nz,.08)*np.exp(-x*9)*1.2
    return s
def whoosh(dur=.45):
    n=int(dur*SR); x=np.arange(n)/n; nz=rng.standard_normal(n)
    return lp(nz,.02+.35*x**2)*(x**2)*1.6
def riser(dur):
    n=int(dur*SR); x=np.arange(n)/SR; f=200+1800*(x/dur)**2
    return (np.sin(2*np.pi*np.cumsum(f)/SR)*.15+lp(rng.standard_normal(n),.05+.3*(x/dur))*.5)*(x/dur)**1.5
def saw(freq,dur,cut=.08):
    n=int(dur*SR); x=np.arange(n)/SR; s=sum(np.sin(2*np.pi*freq*k*x)/k for k in range(1,12))
    return lp(s,cut)*np.minimum(1,x/.01)*np.exp(-x*1.2)
def bell(freq,dur=1.2):
    n=int(dur*SR); x=np.arange(n)/SR
    return (np.sin(2*np.pi*freq*x)+.4*np.sin(2*np.pi*freq*2.76*x)*np.exp(-x*6))*np.exp(-x*3)*.25

cuts=[1.5,3.5,5.5,7.5,9.5,11.5,13.0]
# intro
add(riser(1.5),0,.9)
for k in range(12): add(hat()*1.2,.45+k*.055,.5,(-1)**k*.5)   # typing ticks
# groove 1.5 -> 13
beat=.5
kicks=[]
b=1.5
while b<13.0-1e-6:
    if not (11.5<=b<13.0 and int((b-11.5)/beat)%2==1): add(kick(),b,1.0); kicks.append(b)
    if int(round((b-1.5)/beat))%2==1: add(clap(),b,.8)
    add(hat(),b+beat/2,.7,.3)
    if int(round((b-1.5)/beat))%4==3: add(hat(True),b+beat/2,.4,-.3)
    b+=beat
# 16th hats in tunnel & panels
for k in range(int(4/0.125)): add(hat(),7.5+k*.125,.35,(-1)**k*.4)
# bass (A F C G per 2s bar) with sidechain
notes=[55,43.65,65.41,49.0]
bass=np.zeros(N)
for i,s0 in enumerate(np.arange(1.5,13.0,1.0)):
    for k in range(4):
        st=s0+k*.25
        if st>=13.0: break
        sg=saw(notes[int((s0-1.5)//2)%4],.24,.06+.04*(k%2))
        a=int(st*SR); bass[a:a+len(sg)]+=sg[:N-a]
duck=np.ones(N)
for kb in kicks:
    a=int(kb*SR); n=int(.3*SR); x=np.arange(min(n,N-a))/SR; duck[a:a+len(x)]=np.minimum(duck[a:a+len(x)],1-.85*np.exp(-x*12))
L+=bass*duck*.55; R+=bass*duck*.55
# transitions
for c in cuts:
    add(whoosh(),c-.45,.6,-.2); add(impact(),c,.9)
# glitch stutters in S7
for k in range(10):
    st=11.55+k*.08
    if rng.random()<.6:
        n=int(.03*SR); add(np.sign(rng.standard_normal(n))*.25*np.exp(-np.arange(n)/SR*60),st,.5,rng.uniform(-.8,.8))
# finale: chord + bell arpeggio for letters
for f in [110,164.81,220,277.18,329.63]:
    n=int(2*SR); x=np.arange(n)/SR; add(lp(sum(np.sin(2*np.pi*f*k*x)/k for k in range(1,6)),.05)*np.exp(-x*1.1)*.18,13.0)
for i,f in enumerate([880,987.77,1108.73,1318.51,1479.98,1760]): add(bell(f),13.0+i*.04+.05,.6,(i-2.5)/3)
# master fade + soft clip
fade=np.ones(N); a=int(14.4*SR); fade[a:]=np.linspace(1,0,N-a)
L*=fade;R*=fade
m=max(np.abs(L).max(),np.abs(R).max()); L=np.tanh(L/m*1.4)/np.tanh(1.4); R=np.tanh(R/m*1.4)/np.tanh(1.4)
data=(np.stack([L,R],1)*0.89*32767).astype(np.int16)
w=wave.open('reel.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes()); w.close()
print('ok')
