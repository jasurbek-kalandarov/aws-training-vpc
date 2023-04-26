import { FrameLocator, Locator, Page } from "@playwright/test";
import { RequestBuilder, httpRequest } from "../../utils";
import fs from 'fs';
import FormData from "form-data";
import { Image } from "../../utils/interfaces";
import { Subscription } from "@aws-sdk/client-sns";

export class Yopmail {
  readonly page: Page;
  readonly baseURL: string;
  public email: Locator;
  private message: Locator;
  private messageContent: FrameLocator;
  private messageHeader: Locator;
  readonly messageTopic: Locator;
  readonly messageSender: Locator;
  readonly messageBody: Promise<string>;
  readonly emailAddress: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = 'https://yopmail.com/';
    this.emailAddress = 'testuser@yopmail.com';
    this.email = this.page.locator('#i-email');
    this.message = this.page.frameLocator('#ifinbox').locator('//button[contains(., "AWS Notifications")]').first();
    this.messageContent = this.page.frameLocator('#ifmail');
    this.messageHeader = this.messageContent.locator('(//header/div)[3]');
    this.messageTopic = this.messageHeader.locator('//div').first();
    this.messageSender = this.messageHeader.locator('//div', { hasText: '@'});
    this.messageBody = this.messageContent.locator('pre').innerText();
  }

  async open(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  async openInbox() {
    await this.page.locator('//input[@name="login"]').type('testuser');
    await this.page.locator('//button[@title="Check Inbox @yopmail.com"]').click();
  }

  async clearInbox() {
    await this.page.locator('(//div[@class="wminboxheader"]/div)[1]/button').click();
    await this.page.waitForTimeout(1500);
    await this.page.locator(('//button[@id="delall"]')).click();
    await this.page.keyboard.press('Enter');
  }

  async refreshPage() {
    await this.page.locator('//button[@id="refresh"]').click();
  }

  async openMessage() {
    await this.message.click();
    await this.page.waitForLoadState("networkidle");
    await this.refreshPage();
  }

  async confirmSubsricption() {
    await this.messageContent.locator('//a[.="Confirm subscription"]').first().click();
  }

  async subscribeByEmail() {
    const requestConfig = new RequestBuilder();

    requestConfig
      .setUrl(`/notification/testuser@yopmail.com`)
      .setMethod('post')
      .setHeaders('application/json'); 

    await httpRequest(requestConfig);
  }

  async uploadImage() {
    const data = new FormData();
    data.append('upfile', fs.createReadStream('./screenshots/test report.jpg'));
    
    const requestConfig = new RequestBuilder();
    requestConfig
      .setUrl('/image')
      .setMethod("post")
      .setData(data)
      .setHeaders("multipart/form-data");
  
      const response = await httpRequest(requestConfig);
      console.log(`Image upload status...${response.status}`);
      return response;
  }

  async getUploadedImageData() {
    const requestConfig = new RequestBuilder();
    requestConfig
      .setUrl('/image')
      .setMethod("get")
      .setHeaders("application/json");
  
    const { data } = await httpRequest<Image[]>(requestConfig);
    return data[data.length - 1];
  }

  async downloadImage(url: string) {
    const requestConfig = new RequestBuilder();
    const parsedUrl = url.split('api')[1];
    requestConfig
      .setUrl(`${parsedUrl}`)
      .setMethod("get")
      .setHeaders("application/json");
    
    const response = await httpRequest(requestConfig);
    console.log(`Image download status...${response.status}`);
    return response;
  }

  async getNumberOfNotifications() {
    return await this.page.$$('//iframe[@id="ifinbox"]//span[.="AWS Notifications"]');
  }

  async getAllSubscriptions() {
    const requestConfig = new RequestBuilder();
    requestConfig
      .setUrl('/notification')
      .setMethod("get")
      .setHeaders("application/json");
  
    const { data } = await httpRequest<Subscription[]>(requestConfig);
    return data;
  }
}