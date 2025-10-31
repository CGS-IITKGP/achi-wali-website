export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import { verifySMTPConnection } from '@/lib/utils/email';

const GET = async (_: NextRequest) => {
    let dbConnected = false;
    let smtpConnected = false;

    try {
        const connection = await connectToDatabase();

        if (connection.connections[0].readyState === 1) {
            dbConnected = true;
        }
    } catch (_) { }

    try {
        await verifySMTPConnection();

        smtpConnected = true;
    } catch (_) { }

    return NextResponse.json({
        serverStatus: "ONLINE",
        databaseConnection: dbConnected ? "CONNECTED" : "DISCONNECTED",
        smtpConnected: smtpConnected ? "CONNECTED" : "DISCONNECTED",
    });

};

export { GET };
