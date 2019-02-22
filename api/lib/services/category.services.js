import Schmervice from 'schmervice';
import PerformanceWrapper from '../../util/service-performance-wrapper';
import Create from './category/category.create.service';
import FindAllByIds from './category/category.find-all-by-ids.service';
import FindById from './category/category.find-by-id.service';
import GenerateTrainingData from './category/category.generate-training-data.service';
import LinkKeywords from './category/category.link-keywords.service';
import Remove from './category/category.remove.service';
import Train from './category/category.train.service';
import UnlinkKeywords from './category/category.unlink-keywords.service';

module.exports = class CategoryService extends Schmervice.Service {

    async create() {

        return await PerformanceWrapper({ fn: Create, name: 'CategoryService.create' }).apply(this, arguments);
    }

    async findAllByIds() {

        return await PerformanceWrapper({ fn: FindAllByIds, name: 'CategoryService.findAllByIds' }).apply(this, arguments);
    }

    async findById() {

        return await PerformanceWrapper({ fn: FindById, name: 'CategoryService.findById' }).apply(this, arguments);
    }

    async remove() {

        return await PerformanceWrapper({ fn: Remove, name: 'CategoryService.remove' }).apply(this, arguments);
    }

    async linkKeywords() {

        return await PerformanceWrapper({ fn: LinkKeywords, name: 'CategoryService.linkKeywords' }).apply(this, arguments);
    }

    async unlinkKeywords() {

        return await PerformanceWrapper({ fn: UnlinkKeywords, name: 'CategoryService.unlinkKeywords' }).apply(this, arguments);
    }

    async train() {

        return await PerformanceWrapper({ fn: Train, name: 'CategoryService.train' }).apply(this, arguments);
    }

    async generateTrainingData() {

        return await PerformanceWrapper({ fn: GenerateTrainingData, name: 'CategoryService.generateTrainingData' }).apply(this, arguments);
    }
};


