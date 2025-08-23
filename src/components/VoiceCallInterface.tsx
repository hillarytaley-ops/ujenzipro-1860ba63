import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  type: 'supplier' | 'delivery_provider' | 'builder';
  isConnected: boolean;
  isMuted: boolean;
}

interface VoiceCallInterfaceProps {
  deliveryRequestId: string;
  currentUserType: 'supplier' | 'delivery_provider' | 'builder';
  currentUserId: string;
  currentUserName: string;
  participants: Participant[];
}

const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({
  deliveryRequestId,
  currentUserType,
  currentUserId,
  currentUserName,
  participants
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initiateCall = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsCallActive(true);
      setCallDuration(0);
      toast.success('Call connected');
    } catch (error) {
      toast.error('Failed to connect call');
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    toast.success('Call ended');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.success(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  const getParticipantIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return '🏭';
      case 'delivery_provider':
        return '🚚';
      case 'builder':
        return '🏗️';
      default:
        return '👤';
    }
  };

  if (!isCallActive && !isConnecting) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Call
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="space-y-2 mb-4">
              <h3 className="font-semibold">Start Group Call</h3>
              <p className="text-sm text-muted-foreground">
                Connect with all parties for real-time communication
              </p>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>{participants.length} participants available</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {participants.map((participant) => (
                  <Badge key={participant.id} variant="outline" className="text-xs">
                    {getParticipantIcon(participant.type)} {participant.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={initiateCall}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnecting) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <PhoneCall className="h-12 w-12 mx-auto text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Connecting...</h3>
              <p className="text-sm text-muted-foreground">
                Establishing call connection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Call Active</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-lg font-mono">{formatCallDuration(callDuration)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Participants */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-center">Participants</h4>
          <div className="grid grid-cols-2 gap-3">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex flex-col items-center gap-2 p-3 border rounded-lg"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {getParticipantIcon(participant.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="text-xs font-medium truncate w-full">
                    {participant.name}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <div className={`h-2 w-2 rounded-full ${
                      participant.isConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    {participant.isMuted && (
                      <MicOff className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="icon"
            onClick={toggleMute}
            className="h-12 w-12 rounded-full"
          >
            {isMuted ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="destructive"
            size="icon"
            onClick={endCall}
            className="h-12 w-12 rounded-full"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          
          <Button
            variant={isSpeakerOn ? "default" : "outline"}
            size="icon"
            onClick={toggleSpeaker}
            className="h-12 w-12 rounded-full"
          >
            {isSpeakerOn ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Call Info */}
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Voice call quality: Good
          </p>
          <p className="text-xs text-muted-foreground">
            {participants.filter(p => p.isConnected).length} of {participants.length} connected
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceCallInterface;