import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary  } from 'cloudinary'; 

import connectToDatabase  from "@/lib/mongoose";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try {
        await  connectToDatabase();
        const formData = await req.formData();

        let event;

        try{
            event   =   Object.fromEntries(formData.entries());
        }catch{
            return NextResponse.json({message:'Invalid Json format data'},{status:400});
        }

        const file = formData.get('image') as File;
        if (!file) {
            return NextResponse.json({message:'Image file is required'},{status:400});
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'events' }, (error, result) => {
                if (error) return reject(error);
                resolve(result as { secure_url: string });

            }).end(buffer);
            
        });

        event.image=(uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create(event);
        return NextResponse.json({message:'event created successfully',event:createdEvent},{status:201});
    
    }catch (error) {
        console.error(error);
        return NextResponse.json({message:'event creation failed',error: error  instanceof Error ? error.message :'Unknown error'});
 }   
    
}

export async function GET(req: NextRequest, res: NextResponse  ) {
    try {
        await connectToDatabase();

        const events = await Event.find().sort({createdAt: -1});
        return NextResponse.json({message:'events fetched successfully', events},{status:200});
    }catch (error) {
        return NextResponse.json({message:'Failed to fetch events',error: error}, {status:500});
    }

}