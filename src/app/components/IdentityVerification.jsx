import {
  Box, VStack, HStack, Text, Button, IconButton, Input,
  FormControl, FormLabel, Select, Progress, useToast, Image
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle, RefreshCw, Eye } from 'lucide-react';
import SafetyGuarantee from './SafetyGuarantee';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { createLivenessVerification } from '../../../api';

export default function IdentityVerification() {
  const toast = useToast();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const detectionInterval = useRef(null);

  const [step, setStep] = useState(1);
  const [stream, setStream] = useState(null);
  const [challenge, setChallenge] = useState('Loading AI...');
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [captured, setCaptured] = useState({ selfie: null, document: null });
  const [previews, setPreviews] = useState({ selfie: null, document: null });
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [debug, setDebug] = useState({ ear: 0, mar: 0, happy: 0 });
  const [livenessChecks, setLivenessChecks] = useState({
    faceDetected: false, blinked: false, smiled: false,
  });
  const [form, setForm] = useState({ fullName: '', idType: 'nin', idNumber: '' });

  // Load ONLY 2 models - don't load expression model, it's buggy
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          // Don't load faceExpressionNet - we use mouth landmarks instead
        ]);
        setModelsLoaded(true);
        setChallenge('Look into oval');
      } catch (e) {
        console.error(e);
        setModelsLoaded(true);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch { toast({ title: 'Camera error', status: 'error' }); }
  };
  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    setStream(null);
  };
  useEffect(() => { if (step === 2) startCamera(); return () => stopCamera(); }, [step]);

  // EAR - Eye Aspect Ratio
  const getEAR = (eye) => {
    const d = (p1,p2) => Math.hypot(p1.x-p2.x, p1.y-p2.y);
    return (d(eye[1],eye[5]) + d(eye[2],eye[4])) / (2.0 * d(eye[0],eye[3]));
  };
  // MAR - Mouth Aspect Ratio for smile
  const getMAR = (mouth) => {
    // mouth is 20 points (48-67)
    const d = (p1,p2) => Math.hypot(p1.x-p2.x, p1.y-p2.y);
    const width = d(mouth[0], mouth[6]); // corner to corner
    const height = (d(mouth[2], mouth[10]) + d(mouth[4], mouth[8])) / 2;
    return { mar: height/width, width, height };
  };

  const drawOverlay = (det, canvas, video) => {
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const size = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, size);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const cx = canvas.width/2, cy = canvas.height/2.2, w = canvas.width*0.62, h = canvas.height*0.78;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const inOval = det? (()=>{ const b=det.detection.box; const fcx=b.x+b.width/2, fcy=b.y+b.height/2; const dx=(fcx-cx)/(w/2), dy=(fcy-cy)/(h/2); return dx*dx+dy*dy<1; })() : false;
    ctx.strokeStyle = inOval? '#22c55e':'white'; ctx.lineWidth=4; ctx.setLineDash(inOval?[]:[12,8]);
    ctx.beginPath(); ctx.ellipse(cx,cy,w/2,h/2,0,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    if (!det) return;
    const resized = faceapi.resizeResults(det, size);
    ctx.strokeStyle='#22c55e'; ctx.lineWidth=2; const box=resized.detection.box; ctx.strokeRect(box.x,box.y,box.width,box.height);
    ctx.fillStyle='#22c55e'; resized.landmarks.getLeftEye().forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill(); });
    resized.landmarks.getRightEye().forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2); ctx.fill(); });
    ctx.fillStyle='#f59e0b'; resized.landmarks.getMouth().forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill(); });
  };

  useEffect(() => {
    if (step!==2 ||!modelsLoaded ||!videoRef.current ||!overlayCanvasRef.current) return;

    let lastBlink = 0;
    let baselineMAR = null;
    let baselineMouthWidth = null;
    let framesWithEyesClosed = 0;

    detectionInterval.current = setInterval(async () => {
      const video = videoRef.current, overlay = overlayCanvasRef.current;
      if (!video || video.paused || video.readyState<2) return;

      const det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })).withFaceLandmarks();
      drawOverlay(det, overlay, video);

      if (!det) { setChallenge('Move face into oval'); return; }

      // FIRST FRAME: set baselines
      if (baselineMAR === null) {
        const m = getMAR(det.landmarks.getMouth());
        baselineMAR = m.mar;
        baselineMouthWidth = m.width;
        console.log('Baseline MAR:', baselineMAR, 'Width:', baselineMouthWidth);
      }

      const ear = (getEAR(det.landmarks.getLeftEye()) + getEAR(det.landmarks.getRightEye()))/2;
      const { mar, width } = getMAR(det.landmarks.getMouth());

      setDebug({ ear: Number(ear.toFixed(3)), mar: Number(mar.toFixed(3)), happy: 0 });

      // STEP 0: face
      if (challengeIndex === 0) {
        setLivenessChecks(p=>({...p, faceDetected:true}));
        setChallenge('✓ Face found - Now BLINK');
        setTimeout(()=> setChallengeIndex(1), 700);
        return;
      }

      // STEP 1: BLINK - fixed logic
      if (challengeIndex === 1 &&!livenessChecks.blinked) {
        if (ear < 0.27) { // eyes closed - 0.27 is more lenient than 0.22
          framesWithEyesClosed++;
          setChallenge(`Eyes closing... EAR ${ear.toFixed(2)}`);
        } else {
          if (framesWithEyesClosed >= 2 && Date.now()-lastBlink>1000) { // was closed for 2+ frames and now open = blink!
            lastBlink = Date.now();
            setLivenessChecks(p=>({...p, blinked:true}));
            setChallenge('✓ Blink detected!');
            setTimeout(()=> setChallengeIndex(2), 700);
            framesWithEyesClosed = 0;
          } else {
            framesWithEyesClosed = 0;
            setChallenge(`Please BLINK - close eyes - EAR ${ear.toFixed(2)}`);
          }
        }
        return;
      }

      // STEP 2: SMILE - fixed logic using mouth width, not expression model
      if (challengeIndex === 2 &&!livenessChecks.smiled) {
        // Smile = mouth width increases by 15% OR mouth opens a bit
        const widthIncrease = (width - baselineMouthWidth) / baselineMouthWidth;
        const marIncrease = mar - baselineMAR;

        // Debug log
        // console.log('widthInc', widthIncrease, 'mar', mar);

        if (widthIncrease > 0.18 || mar > 0.35) { // smile = wider mouth or open mouth
          setLivenessChecks(p=>({...p, smiled:true}));
          setChallenge(`✓ Smile detected! Width +${(widthIncrease*100).toFixed(0)}%`);
          setTimeout(()=> setChallengeIndex(3), 700);
        } else {
          setChallenge(`SMILE big 😊 - Width +${(widthIncrease*100).toFixed(0)}% (need +18%)`);
        }
        return;
      }

    }, 100); // faster loop

    return () => clearInterval(detectionInterval.current);
  }, [challengeIndex, step, modelsLoaded, livenessChecks.blinked, livenessChecks.smiled]);

  useEffect(() => { if (challengeIndex>=3 &&!captured.selfie) setTimeout(()=>captureSelfie(), 300); }, [challengeIndex]);

  const captureSelfie = () => {
    const v=videoRef.current, c=captureCanvasRef.current; if(!v||!c) return;
    c.width=v.videoWidth; c.height=v.videoHeight; c.getContext('2d').drawImage(v,0,0);
    c.toBlob(b=>{ setCaptured(p=>({...p,selfie:b})); setPreviews(p=>({...p,selfie:URL.createObjectURL(b)})); setChallenge('✓ Done! Upload ID'); }, 'image/jpeg', 0.9);
  };
  const handleDocumentChange = (e)=>{ const f=e.target.files[0]; if(f){ setCaptured(p=>({...p,document:f})); setPreviews(p=>({...p,document:URL.createObjectURL(f)})); } };

  const handleSubmit = async () => {
    if (!captured.selfie ||!captured.document){ toast({title:'Missing', status:'warning'}); return; }
    setLoading(true);
    try {
      const fd=new FormData(); fd.append('selfie',captured.selfie,'selfie.jpg'); fd.append('document',captured.document); fd.append('nin',form.idNumber); fd.append('verificationType',form.idType); fd.append('fullName',form.fullName);
      await createLivenessVerification(fd); setStep(3); stopCamera();
    } catch(err){ toast({title:'Failed', description:err?.response?.data?.message||err.message, status:'error'}); } finally{ setLoading(false); }
  };

  return (
    <Box minH="100vh" bg="brand.background" pb="100px">
      <Box bg="brand.primary" px={6} pt={12} pb={8}>
        <HStack mb={6}>
          <Link to="/profile"><IconButton icon={<ArrowLeft size={20} />} variant="ghost" color="white" aria-label="Back" /></Link>
          <Text fontSize="xl" fontWeight="bold" color="white" flex={1}>Verify</Text>
          <Text fontSize="sm" color="whiteAlpha.800">{challengeIndex+1}/3</Text>
        </HStack>
        <Progress value={((challengeIndex+1)/3)*100} size="xs" colorScheme="green" borderRadius="full" />
      </Box>
      <VStack align="stretch" px={6} mt={-4} spacing={6}>
        {step===1 && (
          <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
            <VStack align="stretch" spacing={5}>
              <Text fontWeight="600">Details</Text>
              <FormControl isRequired><FormLabel>Full Name</FormLabel><Input value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} size="lg" /></FormControl>
              <FormControl><FormLabel>ID Type</FormLabel><Select value={form.idType} onChange={e=>setForm({...form, idType:e.target.value})} size="lg"><option value="nin">NIN</option><option value="bvn">BVN</option></Select></FormControl>
              <FormControl isRequired><FormLabel>ID Number</FormLabel><Input value={form.idNumber} onChange={e=>setForm({...form, idNumber:e.target.value})} size="lg" /></FormControl>
              <Button variant="primary" size="lg" isDisabled={!form.fullName||!form.idNumber} onClick={()=>setStep(2)}>Start Liveness</Button>
            </VStack>
          </Box>
        )}
        {step===2 && (
          <Box bg="white" borderRadius="xl" p={6} boxShadow="sm">
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between"><Text fontWeight="600">Live Check</Text><IconButton icon={<RefreshCw size={18} />} size="sm" onClick={()=>{ setChallengeIndex(0); setLivenessChecks({faceDetected:false, blinked:false, smiled:false}); setPreviews({selfie:null, document:null}); startCamera(); }} /></HStack>
              <Box bg={Object.values(livenessChecks).every(Boolean)?"green.500":"brand.primary"} p={3} borderRadius="lg" textAlign="center">
                <HStack justify="center"><Eye size={18} color="white" /><Text color="white" fontWeight="bold">{challenge}</Text></HStack>
                <Text color="whiteAlpha.700" fontSize="10px" mt={1}>EAR: {debug.ear} | MAR: {debug.mar} | W: smile detection uses mouth width</Text>
              </Box>
              <HStack spacing={2}>{Object.entries(livenessChecks).map(([k,v])=>(<Box key={k} bg={v?"green.100":"gray.100"} px={3} py={1} borderRadius="full"><Text fontSize="xs" fontWeight="600" color={v?"green.700":"gray.500"}>{k} {v?"✓":"○"}</Text></Box>))}</HStack>
              <Box position="relative" borderRadius="2xl" overflow="hidden" bg="black" aspectRatio="3/4" w="full" maxW="380px" mx="auto">
                <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',height:'100%',objectFit:'cover'}} />
                <canvas ref={overlayCanvasRef} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} />
                <canvas ref={captureCanvasRef} style={{display:'none'}} />
                {previews.selfie && <Image src={previews.selfie} position="absolute" top={0} left={0} w="full" h="full" objectFit="cover" />}
              </Box>
              <HStack>
                <Button variant="outline" onClick={captureSelfie} flex={1}>Retake</Button>
                <Button variant="ghost" size="sm" onClick={()=>{ setLivenessChecks({faceDetected:true, blinked:true, smiled:true}); setChallengeIndex(3); }}>Skip (dev)</Button>
              </HStack>
              <FormControl><FormLabel>Upload ID</FormLabel><Input type="file" accept="image/*" onChange={handleDocumentChange} p={1} />{previews.document && <Image src={previews.document} mt={2} borderRadius="lg" maxH="180px" w="full" objectFit="contain" />}</FormControl>
              <Button variant="primary" size="lg" isLoading={loading} isDisabled={!captured.selfie||!captured.document} onClick={handleSubmit}>Submit</Button>
            </VStack>
          </Box>
        )}
        {step===3 && (<Box bg="white" borderRadius="xl" p={8} textAlign="center"><VStack spacing={4}><CheckCircle size={64} color="#2E7D32" /><Text fontWeight="bold">Passed!</Text><Button variant="primary" w="full" onClick={()=>navigate('/payment')}>Continue</Button></VStack></Box>)}
        <SafetyGuarantee />
      </VStack>
    </Box>
  );
}