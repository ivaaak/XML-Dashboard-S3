import { Router } from 'express';
import xmlController from './controllers/xmlController';

const router = Router();

// XML file operations routes
router.get('/xml/list', xmlController.listXmlFiles);
router.get('/xml/content', xmlController.getXmlFileContent);
router.post('/xml/search', xmlController.searchXml);
router.get('/xml/url', xmlController.getSignedUrl);
router.post('/xml/upload', xmlController.uploadXml);
router.delete('/xml/delete', xmlController.deleteXml);

export default router;