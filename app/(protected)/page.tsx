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
	const [videoPlayInitiated, setVideoPlayInitiated] = useState(false);
	const [isProcessingFrame, setIsProcessingFrame] = useState(false);
	const [logs, setLogs] = useState<DetectionLog[]>([]);
	const [connectionStatus, setConnectionStatus] = useState<
		'disconnected' | 'connecting' | 'connected'
	>('disconnected');
	const [lastProcessedTimestamp, setLastProcessedTimestamp] =
		useState<number>(0);

	const videoRef = useRef<HTMLVideoElement>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const logsEndRef = useRef<HTMLDivElement>(null);
	const frameProcessingInterval = useRef<NodeJS.Timeout | null>(null);
	const frameCount = useRef(0);
	const { toast } = useToast();
	const frameRate = 5; // Process 5 frames per second

	useEffect(() => {
		if (logsEndRef.current) {
			logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [logs]);

	useEffect(() => {
		return () => {
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
			}

			if (frameProcessingInterval.current) {
				clearInterval(frameProcessingInterval.current);
				frameProcessingInterval.current = null;
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

	// Effect to start video playback and frame capture when ready
	useEffect(() => {
		if (
			selectedCCTV &&
			videoRef.current &&
			videoLoaded &&
			backendReady &&
			!videoPlayInitiated
		) {
			addLog('Backend ready, starting video playback', 'info');
			setVideoPlayInitiated(true);

			videoRef.current
				.play()
				.then(() => {
					// Start frame capture after video starts playing
					setupFrameCapture();
				})
				.catch(err => {
					console.error('Failed to autoplay:', err);
					addLog(
						"Couldn't autoplay video - user interaction required",
						'warning'
					);
					setVideoPlayInitiated(false);
				});
		}
	}, [videoLoaded, backendReady, selectedCCTV, videoPlayInitiated]);

	// Setup function to capture and send frames
	const setupFrameCapture = () => {
		if (!videoRef.current || !wsRef.current || frameProcessingInterval.current)
			return;

		addLog(`Starting frame capture at ${frameRate} FPS`, 'info');
		frameCount.current = 0;

		// Tell backend we're starting a new detection session
		if (wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ type: 'start_detection' }));
		}

		// Calculate interval based on frame rate
		const intervalMs = 1000 / frameRate;

		frameProcessingInterval.current = setInterval(() => {
			captureAndSendFrame();
		}, intervalMs);
	};

	// Function to capture and send frames to backend
	const captureAndSendFrame = async () => {
		if (
			!videoRef.current ||
			!wsRef.current ||
			wsRef.current.readyState !== WebSocket.OPEN ||
			isProcessingFrame
		) {
			return;
		}

		try {
			setIsProcessingFrame(true);
			frameCount.current++;

			// Create a canvas to draw the current video frame
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d');

			const video = videoRef.current;
			const width = video.videoWidth;
			const height = video.videoHeight;

			// Set canvas size to match video frame
			canvas.width = width;
			canvas.height = height;

			// Draw current video frame to canvas
			context?.drawImage(video, 0, 0, width, height);

			// Convert canvas to blob
			const blob = await new Promise<Blob>(resolve => {
				canvas.toBlob(
					blob => {
						if (blob) resolve(blob);
						else resolve(new Blob([]));
					},
					'image/jpeg',
					0.8
				); // JPEG with 80% quality for smaller size
			});

			// Send blob to backend
			wsRef.current.send(blob);
		} catch (error) {
			console.error('Error capturing frame:', error);
		} finally {
			setIsProcessingFrame(false);
		}
	};

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
		if (frameProcessingInterval.current) {
			clearInterval(frameProcessingInterval.current);
			frameProcessingInterval.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setAccidentDetected(false);
		setLogs([]);
		setDetectionActive(false);
		setVideoLoaded(false);
		setBackendReady(false);
		setVideoPlayInitiated(false);
		setLastProcessedTimestamp(0);
		frameCount.current = 0;
	};

	const handleCameraSelect = (camera: CCTV) => {
		cleanupExistingConnection();
		setSelectedCCTV(camera);
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

			ws.onopen = handleWebSocketOpen(camera);
			ws.onmessage = handleWebSocketMessage;
			ws.onclose = handleWebSocketClose;
			ws.onerror = handleWebSocketError;
		} catch (error) {
			console.error('Failed to connect to detection service:', error);
			setConnectionStatus('disconnected');
			addLog(`Connection error: ${(error as Error).message}`, 'error');
		}
	};

	const handleWebSocketOpen = (camera: CCTV) => () => {
		setConnectionStatus('connected');
		addLog('Connected to detection service', 'info');
		setDetectionActive(true);

		// We don't send the video URL anymore since we'll be sending frames directly
		addLog('Ready to process video frames', 'info');
	};

	const handleWebSocketMessage = (event: MessageEvent) => {
		try {
			const data = JSON.parse(event.data);
			console.log('Received WebSocket message:', data);

			// Check for backend ready notification
			if (data.type === 'ready') {
				setBackendReady(true);
				addLog('Backend is ready to start detection', 'info');
			}

			// Handle processing complete message
			if (data.type === 'processing_complete') {
				setDetectionActive(false);

				// Clear the frame processing interval
				if (frameProcessingInterval.current) {
					clearInterval(frameProcessingInterval.current);
					frameProcessingInterval.current = null;
				}

				addLog('Detection processing completed', 'info');

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

					const confidence = data.confidence || 0;
					addLog(`⚠️ ACCIDENT DETECTED!`, 'error');

					toast({
						title: 'Accident Detected!',
						description: `Possible accident detected on camera: ${selectedCCTV?.name}`,
						variant: 'destructive',
						duration: 5000,
					});
				}
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

	const handleWebSocketClose = (event: CloseEvent) => {
		setConnectionStatus('disconnected');
		setDetectionActive(false);
		setBackendReady(false);
		setVideoPlayInitiated(false);

		// Clear frame processing interval
		if (frameProcessingInterval.current) {
			clearInterval(frameProcessingInterval.current);
			frameProcessingInterval.current = null;
		}

		const reason =
			event.reason ||
			(event.code === 1006
				? 'Connection closed abnormally'
				: 'Connection closed');

		addLog(`Disconnected: ${reason}`, 'warning');

		if (selectedCCTV) {
			const backoffTime = event.code === 1006 ? 3000 : 1000;
			addLog(
				`Attempting to reconnect in ${backoffTime / 1000} seconds...`,
				'info'
			);

			setTimeout(() => {
				if (selectedCCTV) {
					addLog('Reconnecting to detection service...', 'info');
					connectToDetectionService(selectedCCTV);
				}
			}, backoffTime);
		}
	};

	const handleVideoEnded = () => {
		addLog('Video playback completed', 'info');

		// Stop frame processing
		if (frameProcessingInterval.current) {
			clearInterval(frameProcessingInterval.current);
			frameProcessingInterval.current = null;
		}

		// Notify backend that video has ended
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(
				JSON.stringify({
					type: 'video_ended',
				})
			);
		}
	};

	const handleWebSocketError = () => {
		setConnectionStatus('disconnected');
		setBackendReady(false);
		setVideoPlayInitiated(false);

		// Clear frame processing interval
		if (frameProcessingInterval.current) {
			clearInterval(frameProcessingInterval.current);
			frameProcessingInterval.current = null;
		}

		addLog('WebSocket connection error', 'error');
	};

	const handleVideoLoaded = () => {
		setVideoLoaded(true);
		addLog('Video loaded successfully, waiting for backend to be ready');
	};

	const handleVideoError = () => {
		setDetectionActive(false);
		setVideoPlayInitiated(false);

		// Clear frame processing interval
		if (frameProcessingInterval.current) {
			clearInterval(frameProcessingInterval.current);
			frameProcessingInterval.current = null;
		}

		addLog('Error playing video', 'error');
		toast({
			title: 'Video Error',
			description: 'There was a problem playing the selected video',
			variant: 'destructive',
		});
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
									<video
										ref={videoRef}
										src={selectedCCTV.accidentVideoUrl}
										muted
										className={cn(
											'aspect-video w-full rounded-none bg-black transition-opacity duration-300',
											videoLoaded && backendReady ? 'opacity-100' : 'opacity-0'
										)}
										onLoadedData={handleVideoLoaded}
										onError={handleVideoError}
										onEnded={handleVideoEnded}
										playsInline
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
