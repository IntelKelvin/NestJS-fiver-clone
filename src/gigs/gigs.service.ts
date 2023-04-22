import { Injectable } from '@nestjs/common';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Gig } from './interfaces/gig.interface';

@Injectable()
export class GigsService {
  constructor(@InjectModel('Gig') private gigModel: Model<Gig>) {}

  private createProjection(): any {
    const gigSchemaPaths = this.gigModel.schema.paths;
  
    const projection = {};
    Object.keys(gigSchemaPaths).forEach(key => {
      if (key !== '__v' && key !== '_id' && key !== 'user_id') {
        projection[key] = 1;
      }
    });
  
    projection['user'] = {
      _id: '$user._id',
      username: '$user.username',
    };  
    return projection;
  }
  
  private getUserLookupAndUnwindStages(): any[] {
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];
  }

  async create(gig: CreateGigDto): Promise<CreateGigDto> {
    const newGig = new this.gigModel(gig);
    return await newGig.save();
  }

  async findAll() {
    const gigs = await this.gigModel.find().exec();
    return gigs
  }

  async findOne(gigId: string): Promise<Gig>  {
    const projection = this.createProjection();

    const result = await this.gigModel.aggregate([
      { $match: { _id: new ObjectId(gigId) } },
      ...this.getUserLookupAndUnwindStages(),
      { $project: projection },
    ]).exec();
  
    return result[0];
  }

  update(id: number, updateGigDto: UpdateGigDto) {
    return `This action updates a #${id} gig`;
  }

  remove(id: number) {
    return `This action removes a #${id} gig`;
  }
}
