'use client';

import { useState, useEffect, useRef } from 'react';
import Dashboard from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { CCTVSelectionDialog } from '@/components/cctv/CCTVSelectionDialog';
import { CCTV } from '@/components/cctv/types';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
	Loader2,
	Search,
	Video,
	Calendar,
	Clock,
	ArrowRight,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ToastAction } from '@/components/ui/toast';

type DetectionLog = {
	time: string;
	message: string;
	severity: 'info' | 'warning' | 'error';
};

export default function Page() {
	const [cctvs, setCCTVs] = useState<CCTV[]>([]);
	const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
	const [loading, setLoading] = useState(false);
	const [showSelectionDialog, setShowSelectionDialog] = useState(false);
	const [accidentDetected, setAccidentDetected] = useState(false);
	const [detectionActive, setDetectionActive] = useState(false);
	const [videoLoaded, setVideoLoaded] = useState(false);
	const [backendReady, setBackendReady] = useState(false);
	const [logs, setLogs] = useState<DetectionLog[]>([]);
	const [connectionStatus, setConnectionStatus] = useState<
		'disconnected' | 'connecting' | 'connected'
	>('disconnected');
	const [lastProcessedTimestamp, setLastProcessedTimestamp] =
		useState<number>(0);
	const [processingComplete, setProcessingComplete] = useState(false);

	const wsRef = useRef<WebSocket | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const currentCCTVRef = useRef<CCTV | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		if (logsEndRef.current) {
			logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [logs]);

	useEffect(() => {
		currentCCTVRef.current = selectedCCTV;
	}, [selectedCCTV]);

	useEffect(() => {
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		let pingInterval: NodeJS.Timeout | null = null;

		if (wsRef.current && connectionStatus === 'connected') {
			pingInterval = setInterval(() => {
				if (wsRef.current?.readyState === WebSocket.OPEN) {
					try {
						wsRef.current.send(JSON.stringify({ type: 'ping' }));
					} catch (error) {
						console.error('Error sending ping:', error);
					}
				}
			}, 30000);
		}

		return () => {
			if (pingInterval) clearInterval(pingInterval);
		};
	}, [connectionStatus]);

	const addLog = (
		message: string,
		severity: 'info' | 'warning' | 'error' = 'info'
	) => {
		setLogs(prev => [
			...prev,
			{
				time: new Date().toLocaleTimeString(),
				message,
				severity,
			},
		]);
	};

	const handleOpenCameraSelector = async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/cctvs');

			if (!response.ok) {
				throw new Error(`API error: ${response.status}`);
			}

			const data = await response.json();
			const camerasWithVideos = data.filter(
				(cctv: CCTV) => cctv.hasAccidentVideo && cctv.accidentVideoUrl
			);

			setCCTVs(camerasWithVideos);
			setShowSelectionDialog(true);
		} catch (error) {
			console.error('Failed to load cameras:', error);
			toast({
				title: 'Error loading cameras',
				description: (error as Error).message || 'Failed to load camera data',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	const cleanupExistingConnection = () => {
		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setAccidentDetected(false);
		setLogs([]);
		setDetectionActive(false);
		setVideoLoaded(false);
		setBackendReady(false);
		setLastProcessedTimestamp(0);
		setProcessingComplete(false);

		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx) {
				ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			}
		}
	};

	const handleCameraSelect = (camera: CCTV) => {
		cleanupExistingConnection();
		setSelectedCCTV(camera);
		currentCCTVRef.current = camera;
		setShowSelectionDialog(false);
		addLog('Initializing accident detection system...');
		connectToDetectionService(camera);
	};

	const connectToDetectionService = (camera: CCTV) => {
		try {
			setConnectionStatus('connecting');
			addLog('Connecting to detection service...');

			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host =
				process.env.NODE_ENV === 'production'
					? window.location.host
					: 'localhost:8000';

			const ws = new WebSocket(`${protocol}//${host}/ws/detect`);
			wsRef.current = ws;

			ws.onopen = () => {
				setConnectionStatus('connected');
				addLog('Connected to detection service', 'info');
				setDetectionActive(true);

				const videoUrl = camera.accidentVideoUrl;
				ws.send(
					JSON.stringify({
						type: 'process_video',
						video_url: videoUrl,
						camera_id: camera.id,
						camera_name: camera.name,
						latitude: camera.latitude,
						longitude: camera.longitude,
					})
				);

				addLog(`Sent video URL to backend for processing`, 'info');
			};

			ws.onmessage = event => handleWebSocketMessage(event, camera);
			ws.onclose = handleWebSocketClose;
			ws.onerror = handleWebSocketError;
		} catch (error) {
			console.error('Failed to connect to detection service:', error);
			setConnectionStatus('disconnected');
			addLog(`Connection error: ${(error as Error).message}`, 'error');
		}
	};

	const handleWebSocketMessage = (
		event: MessageEvent,
		cameraAtConnection?: CCTV
	) => {
		try {
			const data = JSON.parse(event.data);
			console.log('Received WebSocket message type:', data.type);

			if (data.type === 'ready') {
				setBackendReady(true);
				addLog('Backend is ready to process video', 'info');
			}

			if (data.type === 'frame') {
				displayFrame(data.frame);
				if (!videoLoaded) {
					setVideoLoaded(true);
				}
			}

			if (data.type === 'processing_complete') {
				setDetectionActive(false);
				setProcessingComplete(true);
				addLog('Video processing completed', 'info');

				if (data.accident_found) {
					addLog('Accident was detected in this video', 'warning');
				} else if (data.accident_found === false) {
					addLog('No accidents detected in this video', 'info');
				}
			}

			if (data.accident_detected) {
				const messageTimestamp = data.timestamp || Date.now();

				if (messageTimestamp > lastProcessedTimestamp) {
					setLastProcessedTimestamp(messageTimestamp);
					setAccidentDetected(true);

					const camera =
						cameraAtConnection || currentCCTVRef.current || selectedCCTV;

					if (!camera) {
						addLog('Error: No CCTV selected when accident detected', 'error');
						return;
					}

					const confidence = data.confidence || 0;
					addLog(
						`⚠️ ACCIDENT DETECTED! (confidence: ${(confidence * 100).toFixed(1)}%)`,
						'error'
					);

					toast({
						title: 'Accident Detected!',
						description: `Possible accident detected on camera: ${camera.name}`,
						variant: 'destructive',
						duration: 5000,
					});
				} else {
					console.log('Ignoring duplicate accident detection message');
				}
			}

			if (data.type === 'image_saved') {
				const messageTimestamp = data.timestamp || Date.now();
				const camera =
					cameraAtConnection || currentCCTVRef.current || selectedCCTV;

				if (!camera) {
					addLog('Error: No CCTV selected when image was saved', 'error');
					return;
				}

				console.log('Received accident image URL:', data.image_url);
				addLog(`Accident image saved: ${data.image_url}`, 'info');

				let thumbnailUrl = data.image_url;

				const incidentData = {
					cctvId: camera.id,
					confidenceScore: data.confidence || 0,
					imageUrl: data.image_url,
					thumbnailUrl,
					latitude: camera.latitude,
					longitude: camera.longitude,
					location:
						data.location ||
						`${camera.latitude.toFixed(6)}, ${camera.longitude.toFixed(6)}`,
					incidentType: data.accident_type,
					metadata: {
						frameNumber: data.frame_number,
						detectedAt: new Date().toISOString(),
						accidentType: data.accident_type,
						isLocalFile: true,
					},
				};

				fetch('/api/incidents', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(incidentData),
				})
					.then(async response => {
						if (response.ok) {
							const result = await response.json();
							addLog(
								`Incident #${result.id || ''} created and ready for verification`,
								'info'
							);
							toast({
								title: 'Incident Created!',
								description: `Incident #${result.id} has been created and is ready for verification.`,
								duration: 5000,
								action: (
									<ToastAction
										className='font-semibold'
										asChild
										altText='View incident details'>
										<a
											href={`/incident_verification/${result.id}`}
											target='_blank'>
											View Incident
										</a>
									</ToastAction>
								),
							});
						} else {
							const errorText = await response
								.text()
								.catch(() => 'Unknown error');
							addLog(
								`Failed to create incident record: ${response.status} ${errorText}`,
								'error'
							);
						}
					})
					.catch(error => {
						console.error('Error creating incident:', error);
						addLog(`Error creating incident: ${error.message}`, 'error');
					});
			}

			if (data.message) {
				addLog(data.message, data.severity || 'info');
			}

			if (data.type === 'pong') {
				console.log('Received pong from server');
			}
		} catch (error) {
			console.error('Error parsing WebSocket message:', error);
			addLog(`Error parsing message: ${(error as Error).message}`, 'warning');
		}
	};

	const displayFrame = (base64Image: string) => {
		if (!canvasRef.current) return;

		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			if (canvasRef.current) {
				if (
					canvasRef.current.width !== img.width ||
					canvasRef.current.height !== img.height
				) {
					canvasRef.current.width = img.width;
					canvasRef.current.height = img.height;
				}
				ctx.drawImage(img, 0, 0);
			}
		};
		img.src = `data:image/jpeg;base64,${base64Image}`;
	};

	const handleWebSocketClose = (event: CloseEvent) => {
		setConnectionStatus('disconnected');
		setDetectionActive(false);
		setBackendReady(false);

		const reason =
			event.reason ||
			(event.code === 1006
				? 'Connection closed abnormally'
				: 'Connection closed');

		addLog(`Disconnected: ${reason}`, 'warning');

		if (currentCCTVRef.current && !processingComplete) {
			const backoffTime = event.code === 1006 ? 3000 : 1000;
			addLog(
				`Attempting to reconnect in ${backoffTime / 1000} seconds...`,
				'info'
			);

			setTimeout(() => {
				if (currentCCTVRef.current && !processingComplete) {
					addLog('Reconnecting to detection service...', 'info');
					connectToDetectionService(currentCCTVRef.current);
				}
			}, backoffTime);
		}
	};

	const handleWebSocketError = () => {
		setConnectionStatus('disconnected');
		setBackendReady(false);
		addLog('WebSocket connection error', 'error');
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch {
			return 'Unknown date';
		}
	};

	return (
		<Dashboard>
			<div className='mx-auto flex max-w-[1800px] flex-1 flex-col gap-6 p-6 pt-0'>
				<div className='flex flex-col justify-between gap-4 border-b border-gray-800 py-6 sm:flex-row sm:items-center'>
					<div>
						<h1 className='text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl'>
							Accident Detection
						</h1>
						<p className='mt-1 text-sm text-gray-400 sm:text-base'>
							Review and analyze accident footage from CCTV cameras
						</p>
					</div>

					<Button
						size='lg'
						className='gap-2 bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-900/20'
						onClick={handleOpenCameraSelector}
						disabled={loading}>
						{loading ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<Video className='h-4 w-4' />
						)}
						Select Camera
					</Button>
				</div>

				{!selectedCCTV ? (
					<div className='to-gray-850 flex h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-gray-700 bg-gradient-to-b from-gray-900 p-8 text-center shadow-xl shadow-black/20'>
						<div className='mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800/50 ring-4 ring-gray-700/30'>
							<Video className='h-10 w-10 text-gray-600' />
						</div>
						<div className='max-w-md'>
							<h3 className='mb-2 text-xl font-semibold text-gray-200'>
								No camera selected
							</h3>
							<p className='mb-6 text-gray-400'>
								Select a CCTV camera with accident footage to begin analysis.
								Our AI will detect accidents in the video and provide real-time
								insights.
							</p>
							<Button
								variant='outline'
								className='gap-2 border-gray-700 hover:bg-gray-800 hover:text-white'
								onClick={handleOpenCameraSelector}
								disabled={loading}>
								<Video className='h-4 w-4' />
								Browse Cameras
								<ArrowRight className='ml-1 h-4 w-4' />
							</Button>
						</div>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
						<Card className='overflow-hidden border-gray-700 bg-gray-900 text-white shadow-xl shadow-black/20'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 border-b border-gray-800 pb-2'>
								<div>
									<CardTitle className='font-bold tracking-tight'>
										{selectedCCTV.name}
									</CardTitle>
									<CardDescription className='mt-1 flex items-center gap-3 text-gray-400'>
										<span className='flex items-center gap-1'>
											<Calendar className='h-3 w-3' />
											{formatDate(selectedCCTV.createdAt)}
										</span>
										<span className='flex items-center gap-1'>
											<Clock className='h-3 w-3' />
											{new Date(selectedCCTV.createdAt).toLocaleTimeString()}
										</span>
									</CardDescription>
								</div>
								<div className='flex items-center gap-2'>
									{accidentDetected && (
										<div className='flex items-center gap-2 rounded-full border border-red-800 bg-red-950 px-3 py-1 text-sm font-medium text-red-300'>
											<div className='h-2 w-2 animate-pulse rounded-full bg-red-500' />
											Accident
										</div>
									)}

									{connectionStatus === 'connecting' && (
										<div className='flex items-center gap-2 rounded-full border border-blue-800 bg-blue-950 px-3 py-1 text-sm font-medium text-blue-300'>
											<Loader2 className='h-3 w-3 animate-spin' />
											Connecting
										</div>
									)}
								</div>
							</CardHeader>
							<CardContent className='p-0'>
								<div className='relative overflow-hidden'>
									{!videoLoaded || !backendReady ? (
										<div className='absolute inset-0 z-10 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm'>
											<div className='flex flex-col items-center gap-2'>
												<Loader2 className='h-10 w-10 animate-spin text-blue-500' />
												<p className='text-sm text-gray-300'>
													{!videoLoaded
														? 'Loading CCTV feed...'
														: 'Waiting for backend to be ready...'}
												</p>
											</div>
										</div>
									) : null}
									<canvas
										ref={canvasRef}
										className={cn(
											'aspect-video w-full rounded-none bg-black transition-opacity duration-300',
											videoLoaded && backendReady ? 'opacity-100' : 'opacity-0'
										)}
									/>
								</div>
							</CardContent>
							<CardFooter className='flex justify-between border-t border-gray-800 px-4 py-3 text-sm text-gray-400'>
								<span>
									Location: {selectedCCTV.latitude.toFixed(4)},{' '}
									{selectedCCTV.longitude.toFixed(4)}
								</span>
								<span
									className={cn(
										'rounded px-2 py-0.5 text-xs font-medium',
										selectedCCTV.status === 'active'
											? 'bg-green-900/30 text-green-400'
											: 'bg-amber-900/30 text-amber-400'
									)}>
									{selectedCCTV.status.toUpperCase()}
								</span>
							</CardFooter>
						</Card>

						<Card className='flex flex-col border-gray-700 bg-gray-900 text-white shadow-xl shadow-black/20'>
							<CardHeader className='border-b border-gray-800'>
								<CardTitle className='flex items-center justify-between font-bold tracking-tight'>
									<span>Detection Logs</span>
									{detectionActive ? (
										<span className='flex items-center gap-2 rounded-full border border-green-800/50 bg-green-900/30 px-3 py-1 text-sm font-medium text-green-400'>
											<span className='h-2 w-2 animate-pulse rounded-full bg-green-500'></span>
											Active
										</span>
									) : (
										<span className='flex items-center gap-2 rounded-full bg-gray-800/80 px-3 py-1 text-sm font-medium text-gray-400'>
											Inactive
										</span>
									)}
								</CardTitle>
								<CardDescription className='text-gray-400'>
									Real-time accident detection analysis
								</CardDescription>
							</CardHeader>
							<CardContent className='flex flex-grow flex-col p-0'>
								<ScrollArea className='h-[400px] flex-grow px-6 py-4'>
									<div className='min-h-[350px] space-y-2'>
										{logs.length === 0 ? (
											<div className='flex h-80 flex-col items-center justify-center text-gray-500'>
												<div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-800/50'>
													<Search className='h-8 w-8 text-gray-600' />
												</div>
												<p className='font-medium text-gray-400'>
													No detection logs yet
												</p>
												<p className='mt-1 text-xs text-gray-500'>
													Detection process will start automatically
												</p>
											</div>
										) : (
											<>
												{logs.map((log, index) => (
													<div
														key={index}
														className={cn(
															'flex items-start rounded-lg px-3 py-2 transition-colors',
															log.severity === 'error'
																? 'border-l-4 border-red-500 bg-red-900/40 text-red-200'
																: log.severity === 'warning'
																	? 'border-l-4 border-amber-500 bg-amber-900/30 text-amber-200'
																	: 'border-l-4 border-blue-500/50 bg-gray-800/40 text-gray-300'
														)}>
														<span className='mr-3 shrink-0 rounded bg-black/20 px-1.5 py-0.5 font-mono text-xs'>
															{log.time}
														</span>
														<span className='font-medium'>{log.message}</span>
													</div>
												))}
												<div ref={logsEndRef} />
											</>
										)}
									</div>
								</ScrollArea>

								<div className='border-t border-gray-800 p-4 text-xs text-gray-500'>
									{logs.length > 0 ? (
										<div className='flex items-center justify-between'>
											<span>Total entries: {logs.length}</span>
											<span>Last update: {logs[logs.length - 1].time}</span>
										</div>
									) : (
										<div className='text-center'>
											Detection logs will appear here in real-time
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>

			<style jsx global>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				.animate-fade-in {
					animation: fadeIn 0.3s ease-out forwards;
				}
			`}</style>

			<CCTVSelectionDialog
				open={showSelectionDialog}
				onClose={() => setShowSelectionDialog(false)}
				cctvs={cctvs}
				onSelect={handleCameraSelect}
			/>
		</Dashboard>
	);
}
