import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database/db';
import LeaderboardModel from '@/lib/database/models/leaderboard.model';
import { ILeaderboard } from '@/lib/types/domain.types';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();

        const username =
            typeof body.username === 'string'
                ? body.username.trim().toLowerCase()
                : '';

        const gameName =
            typeof body.gameName === 'string'
                ? body.gameName.trim().toLowerCase()
                : '';

        const score = body.score;

        if (!username || !gameName || typeof score !== 'number') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'username, gameName and score are required',
                },
                {
                    status: 400,
                }
            );
        }

        if (!Number.isFinite(score) || score < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Score must be a non-negative number',
                },
                {
                    status: 400,
                }
            );
        }

        const existingEntry = await LeaderboardModel.findOne({
            username,
            gameName,
        });

        if (existingEntry) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Leaderboard entry already exists. Use PATCH to update the score.',
                },
                {
                    status: 409,
                }
            );
        }

        const leaderboardEntry = await LeaderboardModel.create({
            username,
            gameName,
            score,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Leaderboard entry created successfully',
                data: leaderboardEntry,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error('POST leaderboard error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to create leaderboard entry',
            },
            {
                status: 500,
            }
        );
    }
}


export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);

        const gameName = searchParams
            .get('gameName')
            ?.trim()
            .toLowerCase();

        if (!gameName) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'gameName query parameter is required',
                },
                {
                    status: 400,
                }
            );
        }

        const leaderboardEntries = await LeaderboardModel.find({
            gameName,
        })
            .sort({
                score: -1,
                updatedAt: 1,
            })
            .lean<ILeaderboard[]>();

        const leaderboard = leaderboardEntries.map((entry, index) => ({
            id: entry._id.toString(),
            rank: index + 1,
            username: entry.username,
            gameName: entry.gameName,
            score: entry.score,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        }));

        return NextResponse.json(
            {
                success: true,
                data: leaderboard,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('GET leaderboard error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch leaderboard',
            },
            {
                status: 500,
            }
        );
    }
}


export async function PATCH(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();

        const username =
            typeof body.username === 'string'
                ? body.username.trim().toLowerCase()
                : '';

        const gameName =
            typeof body.gameName === 'string'
                ? body.gameName.trim().toLowerCase()
                : '';

        const score = body.score;

        if (!username || !gameName || typeof score !== 'number') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'username, gameName and score are required',
                },
                {
                    status: 400,
                }
            );
        }

        if (!Number.isFinite(score) || score < 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Score must be a non-negative number',
                },
                {
                    status: 400,
                }
            );
        }

        const existingEntry = await LeaderboardModel.findOne({
            username,
            gameName,
        });

        if (!existingEntry) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Leaderboard entry not found',
                },
                {
                    status: 404,
                }
            );
        }

        if (score <= existingEntry.score) {
            return NextResponse.json(
                {
                    success: true,
                    updated: false,
                    message: 'New score is not higher than the existing score',
                    data: existingEntry,
                },
                {
                    status: 200,
                }
            );
        }

        existingEntry.score = score;

        await existingEntry.save();

        return NextResponse.json(
            {
                success: true,
                updated: true,
                message: 'High score updated successfully',
                data: existingEntry,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error('PATCH leaderboard error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to update leaderboard score',
            },
            {
                status: 500,
            }
        );
    }
}