import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io'
import { threadId } from "worker_threads";
@WebSocketGateway({
    cors: {
        origin: 'http://localhost:9000',
        credentials: true,
    }
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            console.log('QUERY', client.handshake.query);
            const token = client.handshake.query.token as string;
            const decoded = this.jwtService.verify(token);
            console.log('AUTEHNTICATED', decoded);
            client.data.user = decoded.sub;
        } catch (err) {
            console.log('ERROR WEBSOCKET', err);
            client.disconnect();
        }
        
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        
    }

    @SubscribeMessage('joinThread')
    handleJoinThread(@MessageBody() threadId: string, @ConnectedSocket() client: Socket) {
        client.join(threadId);
        console.log(`Client: ${client.id} connected to ${threadId}`);
    }

    sendMessage(threadId: string, message: any) {
        this.server.to(threadId).emit('newMessage', message);
    }
}