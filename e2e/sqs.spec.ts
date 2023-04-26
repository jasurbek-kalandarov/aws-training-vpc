import { test } from '@playwright/test';
import { CloudxImage } from '../utils/interfaces';
import { readJsonData, httpRequest, RequestBuilder } from '../utils/index';
import { sns } from '../aws/sdk';
import { expect } from 'chai';
import SNS from 'aws-sdk/clients/sns';
import { Yopmail } from './pageobjects/yopmail';
import { BrowserContext } from '@playwright/test';
import fs from 'fs';
import { AxiosResponse } from 'axios';


// test('has title', async ({ page }) => {
  
// });

test.describe.configure({ mode: 'serial' });

test.describe('SNS', () => {
  let topic: SNS.GetTopicAttributesResponse;
  let mail: Yopmail;
  let requestConfig: RequestBuilder;
  let context: BrowserContext;
  let messageBody: string;
  let downloadLink: string;
  let unsubscribeLink: string;
  let cloudximageData: CloudxImage;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    mail = new Yopmail(await context.newPage());
    requestConfig = new RequestBuilder();
    cloudximageData = await readJsonData('cloudximage');
  });

  test('Check topic ARN', async () => {
    const params = {
      TopicArn: cloudximageData.sns.topicArn
    };

    topic = await sns.getTopicAttributes(params).promise();;

    expect(cloudximageData.sns.topicArn).to.equal(topic.Attributes?.TopicArn)
  });

  test('Check topic tag', async () => {
    const params = {
      ResourceArn: cloudximageData.sns.topicArn
    };
    
    const { Tags } = await sns.listTagsForResource(params).promise();
    const hasCloudxKey = Tags?.some(tag => tag.Key === 'cloudx');

    expect(hasCloudxKey).to.be.true;
  });

  test('The user can subscribe to notifications about application events via a provided email address', async () => {
    await mail.open();
    await mail.openInbox();

    //Subscribe to notification by email
    await mail.subscribeByEmail();
    await mail.page.waitForTimeout(2000);
    await mail.refreshPage();
    await mail.openMessage();
    await mail.page.waitForTimeout(2000);

    expect(await mail.messageTopic.innerText()).to.contain('AWS Notification - Subscription Confirmation');
    expect(await mail.messageSender.innerText()).to.contain('no-reply@sns.amazonaws.com');
    
  });

  test('The user has to confirm the subscription after receiving the confirmation email', async ({ browser }) => {
    await mail.confirmSubsricption();
    await mail.page.waitForTimeout(3000);

    const [mailPage, currentPage] = context.pages();

    const currentUrl = await currentPage.url();
    expect(currentUrl).to.contain('https://sns.us-east-1.amazonaws.com/');
    await currentPage.close();
  });

  test('The subscribed user receives notifications about images events (image is uploaded, image is deleted)', async () => {
    await mail.uploadImage();
    await mail.page.waitForTimeout(10000);
    await mail.refreshPage();
    await mail.openMessage();

    await mail.page.waitForTimeout(1000);
    messageBody = await mail.messageBody;
    expect(messageBody).to.contain('event_type: upload');
  });

  test('The notification contains the correct image metadata information and a download link', async () => {
    const [
      event_type, object_key, object_type, last_modified, object_size, download_link, , , , unsubscribe_link, rest
    ] = messageBody.split('\n');

    const uploadedImageData = await mail.getUploadedImageData(); 

    expect(object_key).to.contain(uploadedImageData.object_key);
    expect(object_type).to.contain(uploadedImageData.object_type);
    expect(object_size).to.contain(uploadedImageData.object_size);
    expect(download_link).to.contain(`/image/file/${uploadedImageData.id}`);
    downloadLink = download_link.split(': ')[1];
    unsubscribeLink = unsubscribe_link;
  });

  test('The user can download the image using the download link from the notification', async () => {
    const downloadsFolder = 'C:/Users/Jasurbek_Kalandarov/Downloads';

    const {data: imageData} = await mail.downloadImage(downloadLink) as AxiosResponse<string>;
    fs.writeFileSync(`${downloadsFolder}/new.jpeg`, imageData, { encoding: 'utf-8'});

    const allFiles = fs.readdirSync(downloadsFolder, { encoding: 'utf-8'});
    expect(allFiles).to.contain('new.jpeg');
  });

  test('The user can unsubscribe from the notifications', async () => {
    const newPage = await context.newPage();
    await newPage.goto(unsubscribeLink);
    const messageHeader = await newPage.locator('h1').innerText();
    expect(messageHeader).to.equal('Subscription removed!');
    await newPage.close();
  });

  test('The unsubscribed user does not receive further notifications', async () => {
    const numberOfNotifications = (await mail.getNumberOfNotifications()).length;
    await mail.uploadImage();
    await mail.page.waitForTimeout(10000);
    await mail.refreshPage();
    const numberOfNotificationsAfterUpload = (await mail.getNumberOfNotifications()).length;
    expect(numberOfNotifications).to.equal(numberOfNotificationsAfterUpload);
  });

  test('It is possible to view all existing subscriptions using {base URL}/notification GET API call', async () => {
    const subscriptions = await mail.getAllSubscriptions();

    expect(subscriptions).to.have.length;
    expect(subscriptions[0].Endpoint).to.equal(mail.emailAddress);
    expect(subscriptions[0].Protocol).to.equal('email');
    expect(subscriptions[0].TopicArn).to.equal(cloudximageData.sns.topicArn);
  });
});